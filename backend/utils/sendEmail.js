const nodemailer = require("nodemailer");

/**
 * Send an email
 * @param {Object} options - Email options
 */
const sendEmail = async (options) => {
  // DEVELOPMENT MODE OVERRIDE
  // In development, just log emails instead of sending them
  //   if (process.env.NODE_ENV === "development") {
  //     console.log("\n========== EMAIL LOG ==========");
  //     console.log(`TO: ${options.email}`);
  //     console.log(`SUBJECT: ${options.subject}`);
  //     console.log(`CONTENT: ${options.message}`);
  //     console.log("===============================\n");

  //     // Return a fake success response
  //     return {
  //       messageId: `dev-mode-${Date.now()}`,
  //       success: true,
  //     };
  //   }

  // PRODUCTION MODE - Actual email sending
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
          ? process.env.EMAIL_PASSWORD.replace(/\s/g, "")
          : "",
      },
    });

    // Define email options
    const mailOptions = {
      from: `${process.env.FROM_NAME || "Car Rental Service"} <${
        process.env.EMAIL_USERNAME
      }>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || options.message.replace(/\n/g, "<br>"),
    };

    console.log("Sending email to:", options.email);

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email send error:", error);
    // In production, we need to throw the error
    // In development, we've already bypassed this code
    throw error;
  }
};

module.exports = sendEmail;
