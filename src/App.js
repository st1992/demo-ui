import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import LKComponent from './Livekit';

function App() {
  return (
    <Router>
        <React.StrictMode>
            <Routes>
                <Route path="/:meeting_name" element={<LKComponent/>} />
            </Routes>
        </React.StrictMode>
    </Router>
  )
}

export default App