const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const register = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Validate GIU student email
    if (!email.endsWith("@student.giu-uni.de")) {
      return res.status(400).json({
        message: "Please use your GIU student email (@student.giu-uni.de)",
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phoneNumber,
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Attempting to log in with email:', email);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if the user is banned
    if (user.isBanned) {
      console.log('User is banned');
      return res.status(403).json({ message: "Your account has been banned. Please contact admins." });
    }

    console.log('User found, checking password');
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log('Password matched, generating token');
    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    console.log('Token generated, sending response');
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
};
