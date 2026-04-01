# BaldursVTT

**A real-time multiplayer virtual tabletop for D&D, built from scratch.**

Live at → **[baldurs-vtt.vercel.app](https://baldurs-vtt.vercel.app)**  
Server → [baldursvtt-production.up.railway.app](https://baldursvtt-production.up.railway.app)

---

> Create a room. Share the code. Move tokens. Everyone sees it instantly.

---

## What it does

BaldursVTT lets a Dungeon Master spin up a session in seconds — no account required. Players join via a 8-character room code, the DM uploads a map, and everyone moves their character tokens around in real time. Think Roll20 or Owlbear Rodeo, built solo as a portfolio project.

**Core features in v1:**
- Create or join rooms via invite code
- Upload a battle map image (stored on Supabase, broadcast to all clients)
- Add, name, and color character tokens
- Drag tokens across the map — all connected clients update in under 100ms
- Pan across large maps
- State persists — new players joining mid-session see the current map and token positions

---

## The interesting engineering

Most of this project is straightforward fullstack work. Three decisions are worth calling out.

### 1. In-memory state with a dirty flag

The naive approach to real-time token movement is to write every position update to MongoDB as it happens. With fast dragging, that's potentially hundreds of database writes per second per user — which kills performance and runs up costs fast.

Instead, the server holds the current room state (map URL, token positions, connected users) in memory. Every Socket.IO event mutates the in-memory object and sets a `dirty` flag to `true`. A separate interval checks the flag every few seconds — if dirty, it flushes the current state to MongoDB and resets the flag.

This decouples the high-frequency real-time layer from the database entirely. Socket.IO events are fast because they never touch the DB. MongoDB only gets written when something has actually changed, at a controlled rate.

```
Token drag event
      │
      ▼
In-memory state updated (< 1ms)
      │
      ├──► Socket.IO broadcast to room (all clients re-render)
      │
      └──► dirty = true
                │
                ▼ (every N seconds)
          if dirty → write to MongoDB → dirty = false
```

### 2. React Konva for canvas rendering

HTML5 Canvas gives you a pixel buffer and nothing else — you're responsible for hit detection, layering, re-render scheduling, and everything in between. React Konva wraps Konva.js to bring Canvas into React's component model: each map and token is a React component with props, events, and lifecycle, while Konva handles the actual pixel rendering.

This meant drag-and-drop token movement with hit detection was a matter of attaching `onDragEnd` to a Konva `Circle` component rather than manually implementing pointer math against a flat canvas. The map renders on one Konva `Layer`, tokens on a second layer above it — so the map never re-renders when a token moves.

### 3. Socket.IO room isolation

Socket.IO's built-in room concept maps directly to game sessions. When a client joins a room, the server calls `socket.join(roomCode)`. All game events (`token-moved`, `map-updated`, `token-added`, `token-removed`) are broadcast with `io.to(roomCode).emit(...)` — scoped only to that session's participants.

On disconnect, the server removes the user from the in-memory room and broadcasts an updated user list. If the last user leaves, the in-memory state is flushed to MongoDB one final time before being cleared.

---

## Tech stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + Vite | Component model, fast dev server |
| Canvas | React Konva | Canvas in React's component model |
| Real-time | Socket.IO | WebSocket abstraction with rooms, reconnection, fallback |
| Backend | Node.js + Express | REST API + Socket.IO on the same server |
| Database | MongoDB | Flexible schema for room/token documents |
| File storage | Supabase Storage | Persistent public URLs for map images, free tier |
| Client deploy | Vercel | Zero-config React deployment |
| Server deploy | Railway | Node.js server with environment variable management |

---

## Architecture overview

```
┌─────────────────────────────────────────────┐
│                  Client (Vercel)             │
│                                             │
│  React + React Konva                        │
│  ┌──────────────┐  ┌────────────────────┐  │
│  │  Lobby UI    │  │   Room / Canvas    │  │
│  │  Create/Join │  │   Map + Tokens     │  │
│  └──────┬───────┘  └─────────┬──────────┘  │
│         │  REST               │  Socket.IO  │
└─────────┼────────────────────┼─────────────┘
          │                    │
┌─────────▼────────────────────▼─────────────┐
│              Server (Railway)               │
│                                             │
│  Express REST API    Socket.IO              │
│  POST /rooms         join-room              │
│  GET /rooms/:code    token-moved            │
│  POST /rooms/:code/map  map-updated         │
│                                             │
│  In-memory state  ──► dirty flag ──► MongoDB│
│                                             │
│  Multer (upload) ──► Supabase Storage       │
└─────────────────────────────────────────────┘
```

---

## Verified real-time sync

Tested with 3 concurrent clients on separate physical devices — a laptop and 2 mobile phones on independent connections. Token movement initiated on one device renders on all others with no observable lag.

---

## Running locally

**Prerequisites:** Node.js, a MongoDB connection string, a Supabase project with a storage bucket.

```bash
# Clone
git clone https://github.com/TWalt03/baldursvtt
cd baldursvtt

# Server
cd server
npm install
cp .env.example .env        # fill in MONGODB_URI, SUPABASE_URL, SUPABASE_KEY
npm run dev                 # runs on :5000

# Client (new terminal)
cd client
npm install
cp .env.example .env        # set VITE_SERVER_URL=http://localhost:5000
npm run dev                 # runs on :5173
```

Open two browser tabs at `localhost:5173`, create a room in one, join with the code in the other, and drag a token.

---

## What's next (post-v1)

- Fog of war — tiles hidden until a token enters range
- Dice roller — shared roll results broadcast to the room
- Character sheets — persistent per-player stat blocks
- DM controls — lock tokens so only the DM can move specific pieces

---

## Author

**Tyler Walters** · [linkedin.com/in/tylerwalters2025](https://linkedin.com/in/tylerwalters2025) · [github.com/TWalt03](https://github.com/TWalt03)
