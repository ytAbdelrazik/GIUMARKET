const express = require('express');
const app = express();
const cors = require('cors');
const messageRoutes = require('./routes/messageRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const reservationRoutes = require('./routes/reservation');

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/reservations', reservationRoutes);

module.exports = app; 