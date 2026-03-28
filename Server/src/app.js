require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/mongodb');
const roomRoutes = require('./routes/roomRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Connect to DB FIRST, then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

app.use('/api/rooms', roomRoutes);