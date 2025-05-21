const Reservation = require("../models/reservation");
const Product = require("../models/product");
const Message = require("../models/message");
const Conversation = require("../models/conversation");

// Create a new reservation request
const createReservation = async (req, res) => {
  try {
    const { productId } = req.params;
    const buyerId = req.user.id;

    // Find the product
    const product = await Product.findById(productId).populate('seller');
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if product is available
    if (!product.availability) {
      return res.status(400).json({ message: "Product is not available" });
    }

    // Check if user already has a pending reservation for this product
    const existingReservation = await Reservation.findOne({
      product: productId,
      buyer: buyerId,
      status: "pending"
    });

    if (existingReservation) {
      return res.status(400).json({ message: "You already have a pending reservation for this product" });
    }

    // Create new reservation
    const reservation = new Reservation({
      product: productId,
      buyer: buyerId,
      seller: product.seller._id,
    });

    await reservation.save();

    // Find any existing conversation between buyer and seller
    let conversation = await Conversation.findOne({
      participants: { $all: [buyerId, product.seller._id] }
    });

    // If no conversation exists, create a new one
    if (!conversation) {
      conversation = new Conversation({
        participants: [buyerId, product.seller._id],
        productId: productId // Store the current product ID, but don't use it for finding conversations
      });
      await conversation.save();
    }

    // Create automated message about the reservation
    const message = new Message({
      conversationId: conversation._id,
      sender: buyerId,
      text: `I would like to reserve "${product.name}" for ${product.price}. Please review my reservation request.`,
      productId: productId, // Store the current product ID with the message
      room: conversation._id.toString()
    });

    await message.save();

    res.status(201).json({
      reservation,
      message: "Reservation request created and notification sent to seller"
    });
  } catch (error) {
    console.error("Create reservation error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all reservations for a seller
const getSellerReservations = async (req, res) => {
  try {
    const sellerId = req.user.id; // Get the ID from the user object
    const reservations = await Reservation.find({ seller: sellerId })
      .populate("product")
      .populate("buyer", "name email phoneNumber");
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all reservations for a buyer
const getBuyerReservations = async (req, res) => {
  try {
    const buyerId = req.user.id; // Get the ID from the user object
    const reservations = await Reservation.find({ buyer: buyerId })
      .populate("product")
      .populate("seller", "name email phoneNumber");
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Accept a reservation
const acceptReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const sellerId = req.user.id; // Get the ID from the user object

    const reservation = await Reservation.findOne({
      _id: reservationId,
      seller: sellerId,
      status: "pending"
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Update product availability
    const product = await Product.findById(reservation.product);
    if (!product || !product.availability) {
      return res.status(400).json({ message: "Product is no longer available" });
    }

    // Update product and reservation
    product.availability = false;
    reservation.status = "accepted";
    reservation.responseDate = Date.now();

    await Promise.all([product.save(), reservation.save()]);

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Reject a reservation
const rejectReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const sellerId = req.user.id; // Get the ID from the user object

    const reservation = await Reservation.findOne({
      _id: reservationId,
      seller: sellerId,
      status: "pending"
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    reservation.status = "rejected";
    reservation.responseDate = Date.now();
    await reservation.save();

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const buyerId = req.user.id; // Get the ID from the user object

    // Find the reservation
    const reservation = await Reservation.findOne({
      _id: reservationId,
      buyer: buyerId,
      status: "pending", // Only pending reservations can be canceled
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found or cannot be canceled" });
    }

    // Update the reservation status to "canceled"
    reservation.status = "canceled";
    reservation.responseDate = Date.now();
    await reservation.save();

    res.json({ message: "Reservation canceled successfully", reservation });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const cancelReservationAX = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const buyerId = req.user.id; // Get the ID from the user object

    // Find the reservation
    const reservation = await Reservation.findOne({
      _id: reservationId,
      buyer: buyerId,
      status: "pending", // Only pending reservations can be canceled
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found or cannot be canceled" });
    }

    // Check if 48 hours have passed since the reservation was created
    const now = new Date();
    const createdAt = new Date(reservation.createdAt);
    const diffInHours = (now - createdAt) / (1000 * 60 * 60); // milliseconds to hours

    if (diffInHours > 48) {
      return res.status(400).json({ message: "Reservation can no longer be canceled after 48 hours" });
    }

    // Update the reservation status to "canceled"
    reservation.status = "canceled";
    reservation.responseDate = Date.now();
    await reservation.save();

    res.json({ message: "Reservation canceled successfully", reservation });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createReservation,
  getSellerReservations,
  getBuyerReservations,
  acceptReservation,
  rejectReservation,
  cancelReservation,
  cancelReservationAX,
}; 
