# LivePoll

## Real Time Polling Platform
LivePoll is a fullstack real time polling application that allows users to create polls, share them with participants, collect votes, and view results instantly without refreshing the page.

## Features
- User registration and login
- Secure JWT based authentication
- Create and manage polls
- Share polls using unique links
- Public voting without requiring voter accounts
- Real-time vote and result updates
- Live vote distribution
- Poll deadlines and active/closed states
- Creator only voter information
- Poll analytics
- Downloadable poll reports
- Delete polls created by the authenticated user
- Responsive interface for desktop and mobile devices

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- Axios
- React Router
- WebSocket Client

### Backend
- Go
- Gin Framework
- REST APIs
- JWT Authentication
- WebSockets

### Database and Infrastructure
- MongoDB
- Redis
- Docker

### Deployment
- Vercel for the frontend
- Render for the backend

## Real-Time Communication
LivePoll uses WebSockets to provide real-time polling results.When a participant submits a vote, the request is processed by the Go backend and the vote is stored in MongoDB. Redis maintains the live vote counts and publishes vote events. The WebSocket server broadcasts the updated results to connected clients viewing the same poll.The React frontend listens for these updates and refreshes the displayed vote counts and progress information immediately without requiring a page refresh.

## Authentication and Access Control
LivePoll uses JWT-based authentication for creator accounts.Authenticated users can create and manage their own polls. Poll management actions are protected so that users can only access and manage polls belonging to their account.Participants do not need to create an account to vote. They can access a poll through its shared link and submit their response.

## Poll Management
Creators can:
- Create polls
- Add and manage poll options
- Configure poll deadlines
- Share polls
- View live results
- View voter information
- View analytics
- Download poll reports
- Delete their own polls

## Live Results

Results are updated in real time using WebSockets. When a new vote is submitted, connected users viewing the poll can see the updated vote counts without manually refreshing the page.This makes LivePoll suitable for classrooms, meetings, events, surveys, and interactive sessions.

## Analytics and Reports
Creators can view analytics for individual polls and monitor vote distribution.Poll reports can also be downloaded for further analysis and record keeping.

## Project Structur

live-polling-app/
├── frontend/
├── backend/
├── docker-compose.yml
└── README.md

## Local Development

### Prerequisites

Make sure the following are installed:
- Node.js
- npm
- Go
- Docker
- MongoDB
- Redis

### Start Infrastructure

From the project root:

    docker compose up -d

### Start Backend

    cd backend
    go mod tidy
    go run ./cmd/server

### Start Frontend

Open a second terminal:

    cd frontend
    npm install
    npm run dev

The frontend will be available at:

    http://localhost:5173

## Environment Variables

The backend uses the following environment variables:

    MONGO_URI
    REDIS_ADDR
    JWT_SECRET
    PORT

The frontend uses:

    VITE_API_URL
    VITE_WS_URL

Do not commit sensitive environment variables or API credentials to the repository.

## Deployment

Frontend:

https://live-polling-app-eight.vercel.app

Backend:

https://live-polling-l021.onrender.com

## Key Technical Challenge
The main technical challenge was implementing reliable real-time result updates.Initially, votes were successfully stored, but connected clients did not receive updated results automatically. The issue was traced through the frontend WebSocket connection, backend WebSocket handling, Redis event broadcasting, and frontend state updates.The final implementation uses Redis Pub/Sub together with WebSockets to broadcast updated vote information to clients connected to the same poll.

## AI-Assisted Development
AI tools, including ChatGPT and AI assistance in VS Code, were used during development for debugging, code suggestions, UI improvements, WebSockettroubleshooting, API troubleshooting, CORS configuration, deployment issues, and understanding implementation problems.All generated suggestions and changes were reviewed, tested, and verified before being integrated into the application.

## Author
Poovendhan R
