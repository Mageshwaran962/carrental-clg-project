const mongoose = require("mongoose");
const Review = require("./models/Review");
const Car = require("./models/Car");
const User = require("./models/User");
const dotenv = require("dotenv");
const colors = require("colors");
const bcrypt = require("bcryptjs");

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a demo user
const createDemoUser = async () => {
  try {
    // Check if demo user already exists
    const existingUser = await User.findOne({ email: "demo@example.com" });

    if (existingUser) {
      return existingUser._id;
    }

    // Create new demo user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const user = await User.create({
      name: "Demo User",
      email: "demo@example.com",
      password: hashedPassword,
      phone: "1234567890",
      role: "user",
    });

    console.log("Demo user created successfully".green);
    return user._id;
  } catch (err) {
    console.error(`Error creating demo user: ${err.message}`.red);
    process.exit(1);
  }
};

// Add reviews to cars
const addReviews = async () => {
  try {
    // Create multiple users for reviews
    const userIds = [];
    for (let i = 1; i <= 10; i++) {
      // Check if user already exists
      const existingUser = await User.findOne({
        email: `user${i}@example.com`,
      });

      if (existingUser) {
        userIds.push(existingUser._id);
      } else {
        // Create new user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);

        const user = await User.create({
          name: `User ${i}`,
          email: `user${i}@example.com`,
          password: hashedPassword,
          phone: `123456789${i}`,
          role: "user",
        });

        userIds.push(user._id);
      }
    }

    console.log(`${userIds.length} users ready for reviews`.green);

    // Clear existing reviews
    await Review.deleteMany();

    // Get all cars
    const cars = await Car.find();

    // Reviews to add
    const reviewsToAdd = [];

    // Generate random reviews for each car
    for (const car of cars) {
      // Add 1-5 reviews for each car randomly
      const numberOfReviews = Math.floor(Math.random() * 5) + 1;

      // Use different users for each review
      const shuffledUsers = [...userIds].sort(() => 0.5 - Math.random());
      const selectedUsers = shuffledUsers.slice(0, numberOfReviews);

      const reviewTexts = [
        "Great car! Very comfortable and fun to drive.",
        "Excellent condition and good value for money.",
        "Had a wonderful experience renting this car.",
        "Smooth ride and great fuel efficiency.",
        "Loved the features and performance.",
        "Good car but could use better maintenance.",
        "Amazing car, will definitely rent again!",
        "Perfect for our family trip, plenty of space.",
        "Luxury experience at a reasonable price.",
        "The car was clean and performed well during our trip.",
      ];

      for (let i = 0; i < numberOfReviews; i++) {
        // Random rating between 3 and 5
        const rating = Math.floor(Math.random() * 3) + 3;

        reviewsToAdd.push({
          car: car._id,
          user: selectedUsers[i],
          rating,
          comment: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
          createdAt: new Date(),
        });
      }
    }

    // Insert reviews
    if (reviewsToAdd.length > 0) {
      await Review.insertMany(reviewsToAdd);
      console.log(
        `${reviewsToAdd.length} reviews added successfully`.green.inverse
      );

      // Update car ratings
      for (const car of cars) {
        const carReviews = await Review.find({ car: car._id });

        if (carReviews.length > 0) {
          const avgRating =
            carReviews.reduce((sum, review) => sum + review.rating, 0) /
            carReviews.length;

          await Car.findByIdAndUpdate(car._id, {
            avgRating: avgRating.toFixed(1),
            numReviews: carReviews.length,
          });
        }
      }

      console.log("Car ratings updated successfully".green);
    } else {
      console.log("No reviews to add".yellow);
    }

    process.exit();
  } catch (err) {
    console.error(`Error: ${err.message}`.red);
    process.exit(1);
  }
};

// Run the function
addReviews();
