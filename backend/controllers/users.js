const User = require("../models/user");
const bcrypt = require("bcryptjs");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password for security
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
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
};

// Search users by name or email (Admin only)
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      // If no query, return all users (similar to getAllUsers but might have different access control)
      const users = await User.find().select("-password");
      return res.json(users);
    }

    // Search by name or email, case-insensitive
    const users = await User.find({
      $or: [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }],
    }).select("-password");

    res.json(users);
  } catch (err) {
    console.error("Error searching users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllUsers,
  updateUserProfile,
  getUserById,
  searchUsers, // Export the new function
};