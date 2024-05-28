import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import '@livekit/components-styles';
import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  VideoConference,
  useTracks,
} from '@livekit/components-react';
import { PreJoin } from "@livekit/components-react";
import { Track } from 'livekit-client';

function LKComponent() {
  const {meeting_name} = useParams();
  console.log(meeting_name);

  const [username, setUsername] = useState(null);
  const [token, setToken] = useState(null);
  const [lkToken, setLKToken] = useState(null);
  const [lkServer, setLKServer] = useState(null);
  const [recording, setRecording] = useState(false);
  const [host, setHost] = useState(false);
  let param = useParams();
  console.log(param);
  useEffect(() => {
    if (!username) {
      return;
    }
    fetch('https://api-dev.greenpebble-9f517026.centralindia.azurecontainerapps.io/api/v1/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        setUsername(null)
        setToken(data.token);
        })
    }, [username]);

    const onLeave = useCallback(() => {
        setLKServer(null);
        setLKToken(null);
    }, []);

  useEffect(() => {
    if(!token) {
      return;
    }
    fetch('https://api-dev.greenpebble-9f517026.centralindia.azurecontainerapps.io/api/v1/meeting/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        "meeting_name": meeting_name,
        "preferred_video_server_id": "ap1",
        "preferred_realtime_server_id": "ap1"
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        setLKServer(data.video_server_url);
        setLKToken(data.video_server_token);
        setHost(data.role == "host");
      })
    }, [token]);

  if(!lkToken) {
    return (
      <PreJoin
        data-lk-theme="default"
        onSubmit={(values) => {
          console.log('submitted', values);
          setUsername(values.username);
        }}
      />
    );
  }

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={lkToken}
            serverUrl={lkServer}
            // Use the default LiveKit theme for nice styles.
            data-lk-theme="default"
            style={{ height: '100vh' }}
            onDisconnected={onLeave}
            >
            {/* Your custom component with basic video conferencing functionality. */}
            <MyVideoConference />
            {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
            <RoomAudioRenderer />
            {/* Controls for the user to start/stop audio, video, and screen 
            share tracks and to leave the room. */}
            <div className="lk-control-bar">
            {host && <button 
                className="lk-button" 
                style={{ background: `var(--lk-${recording ? "danger": "success"})` }}
                onClick={() => {
                    console.log("Record Meeting");
                    fetch(`https://api-dev.greenpebble-9f517026.centralindia.azurecontainerapps.io/api/v1/meeting/${recording ? "end_record" : "record"}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            "meeting_name": meeting_name
                        })
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log('Success:', data);
                            setRecording(!recording);
                        })
                }}
            >
                {recording ? "Stop Recording" : "Record Meeting"}
            </button>}
            <ControlBar/>
            </div>
            </LiveKitRoom>
        );
    }



function MyVideoConference() {
    // `useTracks` returns all camera and screen share tracks. If a user
    // joins without a published camera track, a placeholder track is returned.
    const tracks = useTracks(
      [
        { source: Track.Source.Camera, withPlaceholder: true },
        { source: Track.Source.ScreenShare, withPlaceholder: false },
      ],
      { onlySubscribed: false },
    );
    return (
      <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
        {/* The GridLayout accepts zero or one child. The child is used
        as a template to render all passed in tracks. */}
        <ParticipantTile />
      </GridLayout>
    );
  }

export default LKComponent;