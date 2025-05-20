const User = require("../models/user");

const adminMiddleware = async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
  
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
  
      next();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };

module.exports = adminMiddleware;