const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Feedback = require("../models/Feedback");
const sendEmail = require("../utils/sendEmail");

// @desc    Get all feedbacks
// @route   GET /api/v1/feedbacks
// @access  Private/Admin
exports.getFeedbacks = asyncHandler(async (req, res, next) => {
  const feedbacks = await Feedback.find()
    .populate({
      path: "user",
      select: "name email",
    })
    .populate({
      path: "car",
      select: "name",
    })
    .populate({
      path: "booking",
      select: "pickupDate returnDate",
    });

  res.status(200).json({
    success: true,
    count: feedbacks.length,
    data: feedbacks,
  });
});

// @desc    Get single feedback
// @route   GET /api/v1/feedbacks/:id
// @access  Private
exports.getFeedback = asyncHandler(async (req, res, next) => {
  const feedback = await Feedback.findById(req.params.id)
    .populate({
      path: "user",
      select: "name email",
    })
    .populate({
      path: "car",
      select: "name",
    })
    .populate({
      path: "booking",
      select: "pickupDate returnDate",
    });

  if (!feedback) {
    return next(
      new ErrorResponse(`Feedback not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is feedback owner or admin
  if (
    feedback.user._id.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this feedback`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: feedback,
  });
});

// @desc    Create new feedback
// @route   POST /api/v1/feedbacks
// @access  Private
exports.createFeedback = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // If name and email not provided, use from user profile
  if (!req.body.name) {
    req.body.name = req.user.name;
  }

  if (!req.body.email) {
    req.body.email = req.user.email;
  }

  const feedback = await Feedback.create(req.body);

  // Send notification to admin about new feedback
  try {
    await sendEmail({
      email: process.env.ADMIN_EMAIL || "admin@carrentalservice.com",
      subject: "New Feedback Received",
      message: `
        A new feedback has been submitted:
        
        From: ${feedback.name} (${feedback.email})
        Subject: ${feedback.subject}
        Message: ${feedback.message}
        ${feedback.rating ? `Rating: ${feedback.rating}/5` : ""}
        
        You can respond to this feedback in the admin dashboard.
      `,
    });

    // Send confirmation to user
    await sendEmail({
      email: feedback.email,
      subject: "Feedback Received - Car Rental Service",
      message: `
        Dear ${feedback.name},
        
        Thank you for taking the time to share your feedback with us. We have received your message and will review it shortly.
        
        Subject: ${feedback.subject}
        
        We appreciate your input as it helps us improve our services. If needed, our team will contact you regarding your feedback.
        
        Best regards,
        The Car Rental Team
      `,
    });
  } catch (err) {
    console.log("Email could not be sent", err);
    // Continue even if email fails
  }

  res.status(201).json({
    success: true,
    data: feedback,
  });
});

// @desc    Update feedback
// @route   PUT /api/v1/feedbacks/:id
// @access  Private/Admin
exports.updateFeedback = asyncHandler(async (req, res, next) => {
  let feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return next(
      new ErrorResponse(`Feedback not found with id of ${req.params.id}`, 404)
    );
  }

  feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: feedback,
  });
});

// @desc    Delete feedback
// @route   DELETE /api/v1/feedbacks/:id
// @access  Private/Admin
exports.deleteFeedback = asyncHandler(async (req, res, next) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return next(
      new ErrorResponse(`Feedback not found with id of ${req.params.id}`, 404)
    );
  }

  await feedback.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Respond to feedback
// @route   PUT /api/v1/feedbacks/:id/respond
// @access  Private/Admin
exports.respondToFeedback = asyncHandler(async (req, res, next) => {
  const { message } = req.body;

  if (!message) {
    return next(new ErrorResponse("Response message is required", 400));
  }

  let feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return next(
      new ErrorResponse(`Feedback not found with id of ${req.params.id}`, 404)
    );
  }

  // Update feedback with admin response
  feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    {
      isResolved: true,
      adminResponse: {
        message,
        respondedAt: Date.now(),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  // Send email to user with admin response
  try {
    await sendEmail({
      email: feedback.email,
      subject: "Response to Your Feedback - Car Rental Service",
      message: `
        Dear ${feedback.name},
        
        Thank you for your feedback regarding our car rental service. Our team has reviewed your message and we'd like to provide the following response:
        
        Your feedback: ${feedback.subject}
        
        Our response: ${message}
        
        If you have any further questions or concerns, please don't hesitate to contact us.
        
        Best regards,
        The Car Rental Team
      `,
    });
  } catch (err) {
    console.log("Email could not be sent", err);
    // Continue even if email fails
  }

  res.status(200).json({
    success: true,
    data: feedback,
  });
});
