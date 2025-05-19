const express = require("express");
const router = express.Router();
const {authMiddleware} = require("../middleware/authMiddleware");

const {adminOnly} = require("../middleware/adminOnly.js");
const { banUser } = require("../controllers/admin.js");

// User reports a user
router.post("/:id", authMiddleware, adminOnly, banUser);

module.exports = router;
