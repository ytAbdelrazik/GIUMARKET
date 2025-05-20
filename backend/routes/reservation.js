const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservation");
const authMiddleware = require("../middleware/authMiddleware");

// Create a reservation request
router.post("/request/:productId", authMiddleware, reservationController.createReservation);

// Get all reservations for a seller
router.get("/seller", authMiddleware, reservationController.getSellerReservations);

// Get all reservations for a buyer
router.get("/buyer", authMiddleware, reservationController.getBuyerReservations);

// Accept a reservation
router.put("/accept/:reservationId", authMiddleware, reservationController.acceptReservation);

// Reject a reservation
router.put("/reject/:reservationId", authMiddleware, reservationController.rejectReservation);

// Cancel a reservation
router.put("/cancel/:reservationId", authMiddleware, reservationController.cancelReservation);

module.exports = router; 