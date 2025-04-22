const Report = require("../models/Report");
const User = require("../models/user");
const Message = require("../models/Message");
const sendEmail = require("../utils/mailer");
// Create a new report
// Create a new report using reporter's email instead of ID
const createReport = async (req, res) => {
  try {
    const { reportedUserEmail, reason, proofUrl } = req.body;

    // Validate input fields
    if (!reason || reason.trim() === "") {
      console.warn("Report creation failed: Reason is missing or empty.");
      return res.status(400).json({ error: "Reason for report is required and cannot be empty." });
    }

    if (!reportedUserEmail || reportedUserEmail.trim() === "") {
      console.warn("Report creation failed: Reported user email is missing.");
      return res.status(400).json({ error: "Reported user's email is required." });
    }

    // Find the reported user by email
    const reportedUser = await User.findOne({ email: reportedUserEmail.trim() });

    if (!reportedUser) {
      console.warn(`Report creation failed: No user found with email '${reportedUserEmail}'`);
      return res.status(404).json({ error: `User with email '${reportedUserEmail}' not found.` });
    }

    // Prevent self-reporting
    if (reportedUser._id.equals(req.user.id)) {
      console.warn(`User ${req.user.id} tried to report themselves.`);
      return res.status(400).json({ error: "You cannot report yourself." });
    }

    // Create and save the report
    const report = new Report({
      reporterId: req.user.id,
      reportedUserId: reportedUser._id,
      reason: reason.trim(),
      proofUrl: proofUrl || "", // allow empty string
    });

    const saved = await report.save();
    console.info(`Report successfully created by ${req.user.id} against ${reportedUser._id}`);
    res.status(201).json(saved);

  } catch (err) {
    console.error("Unexpected error creating report:", err);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};


// Get all reports (admin only)
const getAllReports = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { email, name, type } = user;

    console.log(`Received request to fetch all reports from user: ${name} (${email})`);

    if (type !== "admin") {
      console.warn(`Access denied: User ${name} (${email}) is not an admin`);
      return res.status(403).json({ error: "Access denied: Admins only" });
    }

    console.log(`User ${name} (${email}) is admin, proceeding to fetch reports`);

    const reports = await Report.find()
      .populate("reporterId")
      .populate("reportedUserId");

    console.log(`Fetched ${reports.length} reports from the database`);

    res.status(200).json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Admin takes action and optionally notifies the user
const updateReportStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { email, name, type } = user;

    console.log(`Received request to update report status from user: ${name} (${email})`);

    const reportId = req.params.id;
    const { status, notify } = req.body;

    console.log(`Report ID: ${reportId}`);
    console.log(`Status: ${status}`);
    console.log(`Notify: ${notify}`);

    if (type !== "admin") {
      console.warn(`Access denied: User ${name} (${email}) is not an admin`);
      return res.status(403).json({ error: "Access denied: Admins only" });
    }

    const report = await Report.findByIdAndUpdate(reportId, { status }, { new: true })
      .populate("reporterId");

    if (!report) {
      console.warn(`Report with ID ${reportId} not found`);
      return res.status(404).json({ error: "Report not found" });
    }

    console.log(`Report with ID ${reportId} updated successfully`);

    if (notify) {
      console.log("Attempting to send email notification to reporter...");

      const recipientEmail = report.reporterId.email;
      const subject = "Update on your user report";
      const text = `Hello ${report.reporterId.name},\n\nAn admin has reviewed your report and updated its status to "${status}".\n\nThank you for helping us keep the platform safe.`;

      try {
        await sendEmail(recipientEmail, subject, text);
        console.log("Email sent successfully to reporter");
      } catch (emailError) {
        console.error("Email failed, falling back to in-app message");

        const message = new Message({
          room: `${report.reportedUserId}_${report.reporterId}_${report._id}`,
          sender: req.user.id,
          text: `Action taken on your report: ${status}`,
          productId: null,
        });

        await message.save();
        console.log("In-app fallback message saved successfully");
      }
    }

    res.status(200).json({ message: "Report updated", report });

  } catch (err) {
    console.error("Error updating report:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createReport,
  getAllReports,
  updateReportStatus,
};
