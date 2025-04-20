// chatController.js
const Message = require("../models/Message");
const User = require("../models/user");
const Product = require("../models/product");

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

// Get all conversations for a user
const getConversations = async (req, res) => {
  try {
    const userId = req.user; // From auth middleware

    // Find all unique rooms (conversations) this user is part of
    const messages = await Message.aggregate([
      {
        $match: {
          room: { $regex: userId },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$room",
          lastMessage: { $first: "$text" },
          timestamp: { $first: "$createdAt" },
          productId: { $first: "$productId" },
          lastMessageId: { $first: "$_id" },
        },
      },
    ]);

    // Format the conversations to include other user's info
    const conversations = [];

    for (const conversation of messages) {
      const room = conversation._id;
      const [user1, user2, productId] = room.split("_");

      // Find the other user in the conversation
      const otherUserId = user1 === userId ? user2 : user1;

      // Get user info
      const otherUser = await User.findById(otherUserId).select("name email");

      // Get product info
      const product = await Product.findById(productId).select("name");

      // Count unread messages
      const unreadCount = await Message.countDocuments({
        room,
        sender: otherUserId,
        read: false,
      });

      conversations.push({
        id: room,
        userId: otherUserId,
        name: otherUser ? otherUser.name : "Unknown User",
        lastMessage: conversation.lastMessage,
        timestamp: conversation.timestamp,
        productId: conversation.productId,
        productName: product ? product.name : "Unknown Product",
        unread: unreadCount,
      });
    }

    // Sort by most recent message
    conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(conversations);
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ error: "Error fetching conversations" });
  }
};

// Send a message (HTTP fallback if socket fails)
const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, text, productId } = req.body;
    const room = [sender, receiver, productId].sort().join("_");

    // Create message with consistent timestamp
    const message = new Message({
      room,
      sender,
      text,
      productId,
      createdAt: new Date(),
    });

    // Save to database
    const savedMessage = await message.save();

    console.log("Message saved via HTTP:", savedMessage._id);

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error sending message via HTTP:", error);
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

module.exports = { getMessages, sendMessage, markAsRead, getConversations };
