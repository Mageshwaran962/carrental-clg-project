const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
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
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, "Please provide a rating between 1 and 5"],
  },
  comment: {
    type: String,
    required: [true, "Please provide a review comment"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent user from submitting more than one review per car
ReviewSchema.index({ car: 1, user: 1 }, { unique: true });

// Static method to get average rating and save
ReviewSchema.statics.getAverageRating = async function (carId) {
  const obj = await this.aggregate([
    {
      $match: { car: carId },
    },
    {
      $group: {
        _id: "$car",
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (obj.length > 0) {
      await this.model("Car").findByIdAndUpdate(carId, {
        avgRating: Math.round(obj[0].avgRating * 10) / 10,
        numReviews: obj[0].numReviews,
      });
    } else {
      await this.model("Car").findByIdAndUpdate(carId, {
        avgRating: undefined,
        numReviews: 0,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post("save", function () {
  this.constructor.getAverageRating(this.car);
});

// Call getAverageRating before remove
ReviewSchema.pre("remove", function () {
  this.constructor.getAverageRating(this.car);
});

module.exports = mongoose.model("Review", ReviewSchema);
