const express = require("express");
const { approveListing, banUser, handleDispute, getAdminAnalytics } = require("../controllers/admin");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Approve a listing
router.put("/approve-listing/:productId", authMiddleware.authMiddleware,authMiddleware.adminMiddleware, approveListing);

// Ban a user
router.put("/ban-user/:userId", authMiddleware.authMiddleware, authMiddleware.adminMiddleware, banUser);

// Handle disputes
router.post("/handle-dispute", authMiddleware.authMiddleware, authMiddleware.adminMiddleware, handleDispute);

// Get analytics
router.get("/analytics", authMiddleware.authMiddleware, authMiddleware.adminMiddleware, getAdminAnalytics);

module.exports = router;