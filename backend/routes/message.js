const express = require("express");
const router = express.Router();
const {authMiddleware} = require("../middleware/authMiddleware");
const { createMessage, getMessages } = require("../controllers/messageController");

// Create a new message
router.post("/", authMiddleware, createMessage);

// Get messages for a conversation
router.get("/:conversationId", authMiddleware, getMessages);

module.exports = router; 