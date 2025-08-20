const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car",
    required: true,
  },
  // Customer details
  customerDetails: {
    firstName: {
      type: String,
      required: [true, "Please add first name"],
    },
    lastName: {
      type: String,
      required: [true, "Please add last name"],
    },
    email: {
      type: String,
      required: [true, "Please add email"],
    },
    phone: {
      type: String,
      required: [true, "Please add phone number"],
    },
  },
  // Rental details
  pickupDate: {
    type: Date,
    required: [true, "Please add a pickup date"],
  },
  returnDate: {
    type: Date,
    required: [true, "Please add a return date"],
  },
  pickupTime: {
    type: String,
    required: [true, "Please add pickup time"],
  },
  pickupLocation: {
    type: String,
    required: [true, "Please add a pickup location"],
  },
  dropLocation: {
    type: String,
    required: [true, "Please add a drop location"],
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["credit_card", "paypal", "cash"],
    default: "credit_card",
  },
  // Additional services
  additionalServices: {
    additionalDriver: {
      type: Boolean,
      default: false,
    },
    insurance: {
      type: Boolean,
      default: false,
    },
    gps: {
      type: Boolean,
      default: false,
    },
    childSeat: {
      type: Boolean,
      default: false,
    },
  },
  specialRequests: {
    type: String,
    maxlength: [500, "Special requests cannot be more than 500 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to ensure return date is after pickup date
BookingSchema.pre("save", function (next) {
  if (this.returnDate <= this.pickupDate) {
    const error = new Error("Return date must be after pickup date");
    error.name = "ValidationError";
    next(error);
  }
  next();
});

// Calculate total days for booking
BookingSchema.methods.calculateDays = function () {
  const pickupDate = new Date(this.pickupDate);
  const returnDate = new Date(this.returnDate);
  const diffTime = Math.abs(returnDate - pickupDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

module.exports = mongoose.model("Booking", BookingSchema);
