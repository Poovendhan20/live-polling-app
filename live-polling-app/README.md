# Live Polling App

A full-stack live polling starter built with React/Vite, Go/Gin, MongoDB, Redis, and WebSockets.

## Run locally

1. Start infrastructure from the project root:

   ```bash
   docker compose up -d
   ```

2. Start the backend:

   ```bash
   cd backend
   go mod tidy
   go run ./cmd/server
   ```

3. Start the frontend in a second terminal:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Open `http://localhost:5173`.

## Environment

Backend `.env`: `MONGO_URI` (default `mongodb://localhost:27017`), `REDIS_ADDR` (default `localhost:6379`), `JWT_SECRET`, and `PORT` (default `8080`). Frontend `.env` contains `VITE_API_URL` and `VITE_WS_URL`.

## Architecture decisions

- Signup and login issue JWTs. Only poll management requires JWT; public vote and results links do not.
- A vote fingerprint is a SHA-256 hash of poll ID, client IP, and user agent. Mongo stores it under a unique `(poll_id, fingerprint)` index, preventing repeat votes from the same browser/network identity without requiring voter login.
- Redis hashes are the live source of truth for counts. A successful Mongo vote transaction is followed by a Redis `HINCRBY` and Pub/Sub event. The WebSocket hub subscribes to the poll event stream and broadcasts updated counts to every client in that poll room.
- On a cold Redis key, counts are rebuilt from durable Mongo vote records, so a Redis restart does not erase results.
