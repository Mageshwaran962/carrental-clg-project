const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Booking = require("../models/Booking");
const Car = require("../models/Car");
const sendEmail = require("../utils/sendEmail");

// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @access  Private/Admin
exports.getBookings = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Finding resource
  let query = Booking.find(JSON.parse(queryStr))
    .populate({
      path: "user",
      select: "name email",
    })
    .populate({
      path: "car",
      select: "name price image",
    });

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Booking.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const bookings = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: bookings.length,
    pagination,
    data: bookings,
  });
});

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate({
      path: "user",
      select: "name email",
    })
    .populate({
      path: "car",
      select: "name price image",
    });

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is booking owner or admin
  if (
    booking.user._id.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this booking`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
});

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Check for car availability
  const car = await Car.findById(req.body.car);

  if (!car) {
    return next(
      new ErrorResponse(`Car not found with id of ${req.body.car}`, 404)
    );
  }

  // Check if car is available
  if (!car.isAvailable) {
    return next(new ErrorResponse(`Car is not available for booking`, 400));
  }

  // Calculate total price
  const pickupDate = new Date(req.body.pickupDate);
  const returnDate = new Date(req.body.returnDate);

  if (returnDate <= pickupDate) {
    return next(
      new ErrorResponse("Return date must be after pickup date", 400)
    );
  }

  const diffTime = Math.abs(returnDate - pickupDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Use discounted price if available, otherwise regular price
  const pricePerDay = car.discountPrice || car.price;

  // Calculate total price
  req.body.totalPrice = pricePerDay * diffDays;

  // Add additional services costs if applicable
  if (req.body.additionalServices) {
    if (req.body.additionalServices.additionalDriver) {
      req.body.totalPrice += 15 * diffDays; // ₹15 per day for additional driver
    }
    if (req.body.additionalServices.insurance) {
      req.body.totalPrice += 25 * diffDays; // ₹25 per day for insurance
    }
    if (req.body.additionalServices.gps) {
      req.body.totalPrice += 10 * diffDays; // ₹10 per day for GPS
    }
    if (req.body.additionalServices.childSeat) {
      req.body.totalPrice += 8 * diffDays; // ₹8 per day for child seat
    }
  }

  const booking = await Booking.create(req.body);

  // Send confirmation email
  try {
    const customerName = req.body.customerDetails
      ? `${req.body.customerDetails.firstName} ${req.body.customerDetails.lastName}`
      : req.user.name;

    const customerEmail = req.body.customerDetails
      ? req.body.customerDetails.email
      : req.user.email;

    await sendEmail({
      email: customerEmail,
      subject: "🚗 Booking Confirmation - Royal Cars Rental",
      message: `
Dear ${customerName},

🎉 Congratulations! Your car booking has been confirmed successfully!

📋 BOOKING DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚙 Car: ${car.name}
📅 Pickup Date: ${new Date(booking.pickupDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
📅 Return Date: ${new Date(booking.returnDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
⏰ Pickup Time: ${booking.pickupTime}
📍 Pickup Location: ${booking.pickupLocation}
📍 Drop Location: ${booking.dropLocation}

💰 PRICING BREAKDOWN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Base Rental (${diffDays} day${diffDays > 1 ? "s" : ""}): ₹${
        (car.discountPrice || car.price) * diffDays
      }
${
  req.body.additionalServices?.additionalDriver
    ? `Additional Driver: ₹${15 * diffDays}`
    : ""
}
${
  req.body.additionalServices?.insurance
    ? `Full Insurance: ₹${25 * diffDays}`
    : ""
}
${req.body.additionalServices?.gps ? `GPS Navigation: ₹${10 * diffDays}` : ""}
${req.body.additionalServices?.childSeat ? `Child Seat: ₹${8 * diffDays}` : ""}
─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
💳 Total Amount: ₹${booking.totalPrice}

📞 IMPORTANT REMINDERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Please arrive 15 minutes before your pickup time
✅ Bring a valid driver's license and credit card
✅ Car will be fully fueled - please return in the same condition
✅ Contact us immediately if your plans change

📱 NEED HELP?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 Phone: +012 345 6789
📧 Email: royalcarsproject@gmail.com
🌐 Website: Visit our website for more information

Thank you for choosing Royal Cars! We look forward to serving you.

Safe travels! 🛣️

Best regards,
The Royal Cars Team
      `,
    });
  } catch (err) {
    console.log("Email could not be sent", err);
    // Continue even if email fails
  }

  res.status(201).json({
    success: true,
    data: booking,
  });
});

// @desc    Update booking
// @route   PUT /api/v1/bookings/:id
// @access  Private/Admin
exports.updateBooking = asyncHandler(async (req, res, next) => {
  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  // Update booking status
  booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: booking,
  });
});

// @desc    Delete booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private/Admin
exports.deleteBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  await booking.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get current user bookings
// @route   GET /api/v1/bookings/user
// @access  Private
exports.getUserBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id }).populate({
    path: "car",
    select: "name image price",
  });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// @desc    Cancel booking
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private
exports.cancelBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(
      new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is booking owner
  if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to cancel this booking`,
        401
      )
    );
  }

  // Check if booking is already cancelled
  if (booking.status === "cancelled") {
    return next(new ErrorResponse("This booking is already cancelled", 400));
  }

  booking.status = "cancelled";
  await booking.save();

  // Send cancellation email
  try {
    await sendEmail({
      email: req.user.email,
      subject: "🚗 Booking Cancellation Confirmation - Royal Cars",
      message: `
Dear ${req.user.name},

Your car booking has been cancelled successfully.

📋 CANCELLED BOOKING DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🆔 Booking ID: ${booking._id}
📅 Original Pickup Date: ${new Date(booking.pickupDate).toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      )}
🚙 Car: ${booking.car ? booking.car.name : "Car details unavailable"}

💳 REFUND INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Your refund will be processed within 3-5 business days
✅ Refund amount: ₹${booking.totalPrice}
✅ Payment method: Refunded to original payment source

📞 NEED ASSISTANCE?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 Phone: +012 345 6789
📧 Email: royalcarsproject@gmail.com

If you have any questions or need further assistance, please don't hesitate to contact our customer support team.

We're sorry to see your booking cancelled and hope to serve you again in the future!

Best regards,
The Royal Cars Team
      `,
    });
  } catch (err) {
    console.log("Email could not be sent", err);
    // Continue even if email fails
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
});
