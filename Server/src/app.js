require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./config/mongodb');
const roomRoutes = require('./routes/roomRoutes');
const socketIO = require('./socket/socketIO');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;
socketIO(io);
app.use(express.json());

// Connect to DB FIRST, then start server
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

app.use('/api/rooms', roomRoutes);