const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const Report = require("../models/Report");
const sendEmail = require("../utils/mailer");

// Approve a listing
const approveListing = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isApproved = true;
    await product.save();

    res.json({ message: "Product approved successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Ban a user
const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //cannot ban admin
    if (user.isAdmin) {
      return res.status(403).json({ message: "Cannot ban an admin user" });
    }

    user.isBanned = true;
    await user.save();

    res.json({ message: "User banned successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Handle disputes
const handleDispute = async (req, res) => {
  try {
    console.log("Handling dispute:", req.body);
    const { reportId, resolution } = req.body;

    // Find the report by ID
    const report = await Report.findById(reportId).populate("reportedUserId");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Update the report's status
    report.status = resolution;
    await report.save();

    // If the resolution is "Approved", send a warning email and ban the reported user
    if (resolution === "Approved") {
      const reportedUser = report.reportedUserId;

      if (!reportedUser) {
        return res.status(404).json({ message: "Reported user not found" });
      }

      // Send a warning email to the reported user
      const subject = "Warning: Your account has been flagged";
      const text = `Dear ${reportedUser.name},\n\nYour account has been flagged due to a violation of our policies. As a result, your account has been banned.\n\nIf you believe this is a mistake, please contact support.\n\nThank you.`;

      try {
        await sendEmail(reportedUser.email, subject, text);
        console.log("Warning email sent successfully to the reported user.");
      } catch (emailError) {
        console.error("Failed to send warning email:", emailError);
        return res.status(500).json({ message: "Failed to send warning email." });
      }

      // Ban the reported user
      reportedUser.isBanned = true;
      await reportedUser.save();

      console.log(`User ${reportedUser.email} has been banned.`);
    }

    // If the resolution is "Rejected", send a rejection email to the reporter
    if (resolution === "Rejected") {
      const reporter = await User.findById(report.reporterId);

      if (!reporter) {
        return res.status(404).json({ message: "Reporter not found" });
      }

      // Send a rejection email to the reporter
      const subject = "Dispute Report Rejected";
      const text = `Dear ${reporter.name},\n\nYour report has been reviewed and rejected. Thank you for your understanding.\n\nBest regards.`;

      try {
        await sendEmail(reporter.email, subject, text);
        console.log("Rejection email sent successfully to the reporter.");
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
        return res.status(500).json({ message: "Failed to send rejection email." });
      }
    }

    res.json({ message: "Dispute handled successfully", report });
  } catch (error) {
    console.error("Error handling dispute:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get analytics
const getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    res.json({ totalUsers, totalProducts, totalOrders });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  approveListing,
  banUser,
  handleDispute,
  getAdminAnalytics,
};