const express = require("express");
const usersController = require("../controllers/users");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Public
//TESTED-WORKING
router.get("/", usersController.getAllUsers);

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put("/:id", authMiddleware, usersController.updateUserProfile);

module.exports = router;