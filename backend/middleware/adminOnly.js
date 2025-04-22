// middleware/adminOnly.js
const User = require("../models/user");

const adminOnly = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      console.error(" No user ID in request");
      return res.status(401).json({ error: "Unauthorized: User ID not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error(` User with ID ${userId} not found`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(` User trying to access admin route: ${user.name} (${user.email}) with type: ${user.type}`);

    if (user.type !== "admin") {
      console.error(` Access denied: ${user.email} is not an admin`);
      return res.status(403).json({ error: `Access denied: ${user.email} is not an admin` });
    }

    next();
  } catch (err) {
    console.error(" Admin middleware error:", err);
    res.status(500).json({ error: "Server error while verifying admin status" });
  }
};

module.exports = adminOnly;
