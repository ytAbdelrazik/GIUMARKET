const User = require("../models/user.js");

const banUser = async (req, res) => {
  try {
    const { id } = req.params; // Correctly get id from req.params

    // Find user by ID
    const user = await User.findById(id);

    if (!user) {
      console.log("User not found with ID:", id);
      return res.status(404).json({ message: "User not found" }); // Use 404 for not found
    }

    // Prevent banning oneself (optional but good practice)
    if (req.user.id === id) {
      return res.status(400).json({ message: "Cannot ban yourself" });
    }

    user.isBanned = true;
    await user.save(); // Save the changes to the database

    // Exclude password from the returned user object
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ message: "Successfully banned user", user: userResponse });
  } catch (error) {
    console.error("Ban user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  banUser,
};
