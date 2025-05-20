const express = require("express");
const { approveListing, banUser, handleDispute, getAdminAnalytics } = require("../controllers/admin");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const router = express.Router();

// Approve a listing
router.put("/approve-listing/:productId", authMiddleware,adminMiddleware, approveListing);

// Ban a user
router.put("/ban-user/:userId", authMiddleware, adminMiddleware, banUser);

// Handle disputes
router.post("/handle-dispute", authMiddleware, adminMiddleware, handleDispute);

// Get analytics
router.get("/analytics", authMiddleware, adminMiddleware, getAdminAnalytics);

module.exports = router;