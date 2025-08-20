const express = require("express");
const router = express.Router();
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getUserBookings,
  cancelBooking,
} = require("../controllers/bookings");

const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(protect, authorize("admin"), getBookings)
  .post(protect, createBooking);

router.route("/user").get(protect, getUserBookings);

router
  .route("/:id")
  .get(protect, getBooking)
  .put(protect, authorize("admin"), updateBooking)
  .delete(protect, authorize("admin"), deleteBooking);

router.route("/:id/cancel").put(protect, cancelBooking);

module.exports = router;
