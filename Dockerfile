FROM node:20.11.1-alpine

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY public ./public
COPY src ./src
RUN npm install
RUN npm install -g serve
RUN npm run build
EXPOSE 3000 
CMD serve -s build