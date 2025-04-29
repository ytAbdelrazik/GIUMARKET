// chatRoutes.js
const express = require("express");
const { getMessages, sendMessage, markAsRead, getConversations } = require("../controllers/chat");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Get all conversations for current user
router.get("/conversations", authMiddleware, getConversations);

// Get messages for a specific chat
router.get("/:user1/:user2/:productId", authMiddleware, getMessages);

// Send a message
router.post("/send", authMiddleware, sendMessage);

// Mark message as read
router.patch("/read/:messageId", authMiddleware, markAsRead);

module.exports = router;
