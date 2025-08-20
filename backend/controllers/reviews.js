const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Car = require("../models/Car");

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/cars/:carId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.carId) {
    const reviews = await Review.find({ car: req.params.carId }).populate({
      path: "user",
      select: "name",
    });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate({
      path: "user",
      select: "name",
    })
    .populate({
      path: "car",
      select: "name image",
    });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Add review
// @route   POST /api/v1/cars/:carId/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.car = req.params.carId;
  req.body.user = req.user.id;

  const car = await Car.findById(req.params.carId);

  if (!car) {
    return next(
      new ErrorResponse(`No car with the id of ${req.params.carId}`, 404)
    );
  }

  // Check if user has booked this car before
  const hasBooked = await Booking.findOne({
    user: req.user.id,
    car: req.params.carId,
    status: "completed",
  });

  if (!hasBooked && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `You can only review cars that you have booked and completed the rental period`,
        400
      )
    );
  }

  // Check if user has already reviewed this car
  const alreadyReviewed = await Review.findOne({
    user: req.user.id,
    car: req.params.carId,
  });

  if (alreadyReviewed) {
    return next(
      new ErrorResponse(`You have already submitted a review for this car`, 400)
    );
  }

  // If booking ID is provided, attach it to the review
  if (req.body.bookingId) {
    const booking = await Booking.findById(req.body.bookingId);
    if (!booking) {
      return next(
        new ErrorResponse(
          `No booking with the id of ${req.body.bookingId}`,
          404
        )
      );
    }
    req.body.booking = req.body.bookingId;
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // Update car rating after review is updated
  review.constructor.getAverageRating(review.car);

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to delete review`, 401));
  }

  await review.remove();

  // Update car rating after review is deleted
  review.constructor.getAverageRating(review.car);

  res.status(200).json({
    success: true,
    data: {},
  });
});
