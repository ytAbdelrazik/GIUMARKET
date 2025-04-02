const express = require("express");
const usersController = require("../controllers/users");
const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Public
//TESTED-WORKING
router.get("/", usersController.getAllUsers);

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Public
router.put("/:id", usersController.updateUserProfile);

module.exports = router;