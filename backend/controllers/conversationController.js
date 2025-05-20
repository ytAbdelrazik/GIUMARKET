const Conversation = require("../models/conversation");

// Get all conversations for a user
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
    .populate({
      path: 'participants',
      select: '_id name email' // Only select necessary fields
    })
    .populate({
      path: 'productId',
      select: '_id title price images' // Only select necessary product fields
    })
    .sort({ updatedAt: -1 }); // Sort by most recent first

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getConversations,
}; 