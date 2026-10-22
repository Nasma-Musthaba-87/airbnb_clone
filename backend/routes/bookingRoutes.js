const express = require("express");

const {createBooking, getBookings, cancelBooking, 
  checkAvailability, getBookingbyId, getHostBookings} = require ("../controllers/bookingController");

const protect = require("../middleware/authMiddleware");

const requireHost = require("../middleware/hostMiddleware");

const router = express.Router();

router.post("/", protect, createBooking);

router.get("/mybookings", protect, getBookings);

router.get("/availability", checkAvailability);

router.get("/hostbookings", protect, requireHost, getHostBookings);

router.patch("/:id/cancel", protect, cancelBooking);

router.get("/:id", protect, getBookingbyId);

module.exports = router;