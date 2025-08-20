const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Please provide your name"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  subject: {
    type: String,
    required: [true, "Please add a subject"],
  },
  message: {
    type: String,
    required: [true, "Please add a message"],
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car",
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  isResolved: {
    type: Boolean,
    default: false,
  },
  adminResponse: {
    message: String,
    respondedAt: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Feedback", FeedbackSchema);
