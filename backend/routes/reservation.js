const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservation");

// Create a reservation request
router.post("/request/:productId", reservationController.createReservation);

// Get all reservations for a seller
router.get("/seller", reservationController.getSellerReservations);

// Get all reservations for a buyer
router.get("/buyer", reservationController.getBuyerReservations);

// Accept a reservation
router.put("/accept/:reservationId", reservationController.acceptReservation);

// Reject a reservation
router.put("/reject/:reservationId", reservationController.rejectReservation);

// Cancel a reservation
router.put("/cancel/:reservationId", reservationController.cancelReservation);
module.exports = router; 