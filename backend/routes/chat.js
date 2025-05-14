// chatRoutes.js
const express = require("express");
const { getMessages, sendMessage, markAsRead } = require("../controllers/chat");
const router = express.Router();

router.get("/:user1/:user2/:productId", getMessages);
router.post("/send", sendMessage);
router.patch("/read/:messageId", markAsRead);

module.exports = router;
