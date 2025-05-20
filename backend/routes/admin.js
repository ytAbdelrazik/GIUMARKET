const express = require("express");
const { approveListing, banUser, handleDispute, getAdminAnalytics } = require("../controllers/admin");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const router = express.Router();
const {authMiddleware} = require("../middleware/authMiddleware");

const {adminOnly} = require("../middleware/adminOnly.js");
const { banUser } = require("../controllers/admin.js");

// Approve a listing
router.put("/approve-listing/:productId", authMiddleware,adminMiddleware, approveListing);

// Ban a user
router.put("/ban-user/:userId", authMiddleware, adminMiddleware, banUser);

// Handle disputes
router.post("/handle-dispute", authMiddleware, adminMiddleware, handleDispute);

// User reports a user
router.post("/:id", authMiddleware, adminOnly, banUser);
// Get analytics
router.get("/analytics", authMiddleware, adminMiddleware, getAdminAnalytics);

module.exports = router;
