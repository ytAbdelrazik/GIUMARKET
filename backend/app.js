const messageRoutes = require('./routes/messageRoutes');
const conversationRoutes = require('./routes/conversationRoutes');

// Routes
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes); 