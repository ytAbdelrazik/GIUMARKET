const Message = require("../models/message");
const Conversation = require("../models/conversation");

// Create a new message
const createMessage = async (req, res) => {
  try {
    const { text, receiverId, productId } = req.body;
    
    if (!text || !receiverId || !productId) {
      return res.status(400).json({ 
        error: "Missing required fields: text, receiverId, and productId are required" 
      });
    }

    // First try to find any existing conversation between these users
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, receiverId] }
    });

    // If no conversation exists, create a new one
    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user.id, receiverId],
        productId: productId // Store the current product ID, but don't use it for finding conversations
      });
      await conversation.save();
    }

    const message = new Message({
      conversationId: conversation._id,
      sender: req.user.id,
      text,
      productId: productId, // Store the current product ID with the message
      room: conversation._id.toString()
    });

    await message.save();
    
    // Populate sender information before sending response
    await message.populate('sender');
    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages for a conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId })
      .populate('sender')
      .sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createMessage,
  getMessages,
}; 