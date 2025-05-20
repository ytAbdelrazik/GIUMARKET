const express = require("express");
const usersController = require("../controllers/users");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {adminOnly} = require("../middleware/adminOnly.js");

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Admin
router.get("/", authMiddleware, adminOnly, usersController.getAllUsers);

// @route   GET /api/users/search
// @desc    Search for users by name or email (Admin only)
// @access  Admin
router.get("/search", authMiddleware, adminOnly, usersController.searchUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public (or Authenticated? Check usage)
router.get("/:id", usersController.getUserById);

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put("/:id", authMiddleware, usersController.updateUserProfile);

// @route   DELETE /api/users/delete
// @desc    Delete user account
// @access  Private
router.delete('/delete', authMiddleware, usersController.deleteUser)

module.exports = router;