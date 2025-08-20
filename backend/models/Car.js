const mongoose = require("mongoose");

const CarSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a car name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  type: {
    type: String,
    required: [true, "Please add a car type"],
    enum: ["luxury", "economy", "suv", "sports", "sedan"],
  },
  image: {
    type: String,
    default: "no-photo.jpg",
  },
  gallery: {
    type: [String],
  },
  price: {
    type: Number,
    required: [true, "Please add a rental price per day"],
  },
  discountPrice: {
    type: Number,
  },
  year: {
    type: Number,
    required: [true, "Please add the car year"],
  },
  transmission: {
    type: String,
    required: [true, "Please specify the transmission"],
    enum: ["AUTO", "MANUAL"],
  },
  mileage: {
    type: String,
    required: [true, "Please add the mileage"],
  },
  fuel: {
    type: String,
    required: [true, "Please add the fuel type"],
    enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
  },
  seats: {
    type: Number,
    required: [true, "Please add the number of seats"],
  },
  features: {
    type: [String],
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
  avgRating: {
    type: Number,
    min: [1, "Rating must be at least 1"],
    max: [5, "Rating cannot be more than 5"],
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Car", CarSchema);
