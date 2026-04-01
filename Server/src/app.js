require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./config/mongodb');
const roomRoutes = require('./routes/roomRoutes');
const mapRoutes = require('./routes/mapRoutes');
const socketIO = require('./socket/socketIO');
const cors = require('cors');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  pingTimeout: 2500,
  pingInterval: 2500,
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

app.set('io', io);
socketIO(io);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
  }));
app.use(express.json());

// Connect to DB FIRST, then start server
connectDB().then(() => {
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});

app.use('/api/rooms', roomRoutes);
app.use('/api/map', mapRoutes);