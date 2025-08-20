const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const fileupload = require("express-fileupload");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const colors = require("colors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors());

// Set security HTTP headers
app.use(helmet());

// File uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Car Rental API is running successfully!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/auth",
      cars: "/api/v1/cars",
      bookings: "/api/v1/bookings",
      reviews: "/api/v1/reviews",
      feedback: "/api/v1/feedback",
      contact: "/api/v1/contact",
    },
  });
});

// Define routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/cars", require("./routes/cars"));
app.use("/api/v1/bookings", require("./routes/bookings"));
app.use("/api/v1/reviews", require("./routes/reviews"));
app.use("/api/v1/feedback", require("./routes/feedback"));
app.use("/api/v1/contact", require("./routes/contact"));

// Error handling middleware
app.use(errorHandler);

// Create uploads folder if it doesn't exist
const fs = require("fs");
const uploadDir = path.join(__dirname, "public/uploads/cars");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
