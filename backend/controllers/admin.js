const User = require("../models/user.js");

const banUser = async (req, res) => {
  try {
    const { userId } = req.params.id;

    // Find user
    const user = await User.findOne({ userId });

    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: "Invalid credentials" });
    }
    user.isBanned = true;

    res.json({ message: "successfuly banned user" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  banUser,
};
