const express = require("express");
const User = require("../models/user"); 
const bcrypt = require("bcryptjs");
const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Public 

// to test use the url on POSTMAN preferably the APP to avoid glitches
// if you use the vscode extension it might lag, just minimize and revert it to where it was
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password for security
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Public 
router.put("/:id", async (req, res) => {
    try {
      const { name, email, phoneNumber, password } = req.body;
  
      // Find the user by ID
      let user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // Update fields if provided
      if (name) user.name = name;
      if (email) user.email = email;
      if (phoneNumber) user.phoneNumber = phoneNumber;
  
      // If user wants to update password, hash the new one
      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }
  
      // Save updated user
      await user.save();
      res.json({ message: "Profile updated successfully", user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
module.exports = router;
