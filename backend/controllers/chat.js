// chatController.js
const Message = require("../models/Message");

// Get messages for a specific chat
const getMessages = async (req, res) => {
  try {
    const { user1, user2, productId } = req.params;
    const room = [user1, user2, productId].sort().join("_");
    const messages = await Message.find({ room }).sort("createdAt");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, text, productId } = req.body;
    const room = [sender, receiver, productId].sort().join("_");
    const message = new Message({ room, sender, text, productId });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Error sending message" });
  }
};

// Mark a message as read
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    await Message.findByIdAndUpdate(messageId, { read: true });
    res.json({ message: "Message marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Error marking message as read" });
  }
};

module.exports = { getMessages, sendMessage, markAsRead };
