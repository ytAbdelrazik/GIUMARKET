const express = require("express");
const router = express.Router();
const {authMiddleware} = require("../middleware/authMiddleware");

const {adminOnly} = require("../middleware/adminOnly.js");

const {
  createReport,
  getAllReports,
  updateReportStatus,
} = require("../controllers/reportController");

// User reports a user
router.post("/", authMiddleware, createReport);

// Admin views all reports
router.get("/", authMiddleware, adminOnly, getAllReports);

// Admin updates status of a report and notifies the reporter
router.patch("/:id", authMiddleware, adminOnly, updateReportStatus);

module.exports = router;