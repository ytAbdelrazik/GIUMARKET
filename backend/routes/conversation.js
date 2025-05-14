const express = require("express");
const router = express.Router();
const {authMiddleware} = require("../middleware/authMiddleware");
const { getConversations } = require("../controllers/conversationController");

// Get all conversations for a user
router.get("/", authMiddleware, getConversations);

module.exports = router; 