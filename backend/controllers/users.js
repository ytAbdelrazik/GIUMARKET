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
    console.log('Update profile request received:', {
      params: req.params,
      body: req.body,
      user: req.user
    });

    const { name, email, phoneNumber, password } = req.body;

    // Find the user by ID
    let user = await User.findById(req.params.id);
    if (!user) {
      console.log('User not found with ID:', req.params.id);
      return res.status(404).json({ message: "User not found" });
    }

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
    
    // Send only necessary user information
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber
    };
    
    console.log('Sending success response:', { user: userResponse });
    res.json({ message: "Profile updated successfully", user: userResponse });
  } catch (err) {
    console.error('Error in updateUserProfile:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getAllUsers,
  updateUserProfile,
};