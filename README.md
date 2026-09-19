# LivePoll

> Create. Share. Vote. See results live.

LivePoll is a full-stack real-time polling platform that lets users create polls, share them with participants, collect votes, and watch results update instantly without refreshing the page.

## ✨ Features

- 🔐 User authentication with Login & Sign Up
- 🗳️ Create and manage polls
- 🔗 Share polls using unique links
- 👥 Public voting without requiring voter accounts
- ⚡ Real-time vote and result updates
- 📊 Live results with vote distribution
- 👤 Creator-only voter information
- 📈 Poll analytics
- 📥 Download poll reports
- ⏱️ Poll deadlines and active/closed states
- 🗑️ Delete polls created by the user
- 📱 Responsive design for desktop and mobile

## ⚡ Real-Time Polling

LivePoll uses WebSockets to deliver vote updates instantly.

Participant Vote
       ↓
   Go Backend
       ↓
     MongoDB
       ↓
  Redis Counter
       ↓
 WebSocket Broadcast
       ↓
   React UI Update

This allows connected users to see updated results without manually refreshing the page.

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Go
- Gin
- REST APIs
- JWT Authentication
- WebSockets

### Data & Infrastructure

- MongoDB
- Redis
- Docker

### Deployment

- Vercel — Frontend
- Render — Backend

## 🏗️ Architecture

React / Vite
     │
     ├── REST API ────────→ Go / Gin
     │                         │
     │                         ├── MongoDB
     │                         │
     │                         └── Redis
     │
     └── WebSocket ───────→ Real-Time Updates

MongoDB provides durable vote storage, while Redis maintains fast live vote counts. WebSockets broadcast updated results to connected participants.

## 🔒 Authentication & Voting

Creators authenticate using JWT-based login and signup.

Participants can vote through a shared poll link without creating an account.

Poll management features are protected so that creators can manage only their own polls.

## 🌐 Live Demo

Frontend:
https://live-polling-app-eight.vercel.app

Backend:
https://live-polling-l021.onrender.com

## 📂 Project Structure

live-polling-app/
├── frontend/          # React + Vite application
├── backend/           # Go + Gin API
├── docker-compose.yml
└── README.md

## 🚀 Run Locally

### 1. Start infrastructure

docker compose up -d

### 2. Start backend

cd backend
go mod tidy
go run ./cmd/server

### 3. Start frontend

Open a second terminal:

cd frontend
npm install
npm run dev

Open:

http://localhost:5173

## 💡 Key Technical Challenge

The main challenge was implementing reliable real-time result updates.

Initially, votes were stored successfully, but connected clients did not receive updated results automatically. The issue was traced through the WebSocket connection and real-time broadcast flow.

The final implementation uses Redis Pub/Sub and WebSockets to broadcast updated vote counts to clients connected to the same poll.

## 🤖 AI-Assisted Development

AI tools including ChatGPT and AI assistance in VS Code were used during development for:

- Debugging
- Code suggestions
- UI improvements
- WebSocket troubleshooting
- API troubleshooting
- CORS and deployment debugging
- Understanding implementation issues

All changes were tested and verified within the application.
## 👨‍💻 Author
Poovendhan R

-
⭐ LivePoll — Build a poll, share it, and watch the room respond.
