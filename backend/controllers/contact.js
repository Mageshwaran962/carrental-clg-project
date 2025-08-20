const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/sendEmail");

// @desc    Submit contact form
// @route   POST /api/v1/contact
// @access  Public
exports.submitContactForm = asyncHandler(async (req, res, next) => {
  const { name, email, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !subject || !message) {
    return next(new ErrorResponse("Please provide all required fields", 400));
  }

  // Send email to admin
  try {
    await sendEmail({
      email: process.env.EMAIL_FROM, // Send to admin email
      subject: `Contact Form: ${subject}`,
      message: `
New Contact Form Submission

From: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This message was sent via the Royal Cars contact form.
      `,
    });
  } catch (err) {
    console.log("Admin notification email could not be sent", err);
  }

  // Send confirmation email to customer
  try {
    await sendEmail({
      email: email,
      subject: "✅ We've Received Your Message - Royal Cars",
      message: `
Dear ${name},

Thank you for contacting Royal Cars! 🚗

We have successfully received your message regarding: "${subject}"

📧 WHAT HAPPENS NEXT?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Our customer service team will review your inquiry
✅ We'll get back to you within 24 hours with detailed information
✅ For urgent matters, please call us at +012 345 6789

📋 YOUR MESSAGE SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject: ${subject}
Message: ${message}

📞 NEED IMMEDIATE ASSISTANCE?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 Phone: +012 345 6789
📧 Email: royalcarsproject@gmail.com
⏰ Business Hours: Mon-Fri 9AM-8PM, Sat-Sun 10AM-6PM

We appreciate your interest in Royal Cars and look forward to assisting you soon!

Best regards,
The Royal Cars Customer Service Team

---
This is an automated confirmation. Please do not reply to this email.
For immediate assistance, please contact us using the information above.
      `,
    });
  } catch (err) {
    console.log("Customer confirmation email could not be sent", err);
    // Don't fail the request if confirmation email fails
  }

  res.status(200).json({
    success: true,
    message:
      "Message sent successfully! We'll get back to you within 24 hours.",
  });
});
