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

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, receiverId] },
      productId: productId
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user.id, receiverId],
        productId: productId
      });
      await conversation.save();
    }

    const message = new Message({
      conversationId: conversation._id,
      sender: req.user.id,
      text,
      productId: conversation.productId,
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