# LivePoll

> **Create. Share. Vote. See results live.**

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
- 📱 Responsive UI for desktop and mobile

## ⚡ Real-Time Polling

LivePoll uses WebSockets to deliver vote updates instantly.

```text
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
