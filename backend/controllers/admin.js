const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");

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
    const { orderId, resolution } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.disputeResolution = resolution;
    await order.save();

    res.json({ message: "Dispute resolved successfully", order });
  } catch (error) {
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