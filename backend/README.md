# Car Rental Backend API

> Backend API for a car rental application with authentication, booking system, user reviews, and email notifications.

## Usage

Rename ".env.example" to ".env" and update the values/settings to your own.

## Install Dependencies

```
npm install
```

## Run Application

```
# Run in development mode
npm run dev

# Run in production mode
npm start
```

## Database Models

### User Model

- name
- email
- password
- role (user/admin)
- phone
- address
- resetPasswordToken
- resetPasswordExpire

### Car Model

- name
- description
- type
- image
- gallery
- price
- discountPrice
- year
- transmission
- mileage
- fuel
- seats
- features
- isAvailable
- isPopular
- avgRating
- numReviews

### Booking Model

- user
- car
- pickupDate
- returnDate
- pickupLocation
- returnLocation
- totalPrice
- status
- paymentStatus
- paymentMethod
- additionalServices
- driverDetails

### Review Model

- user
- car
- booking
- rating
- comment

### Feedback Model

- user
- name
- email
- subject
- message
- car
- booking
- rating
- isResolved
- adminResponse

## API Endpoints

### Authentication

- POST /api/v1/auth/register - Register user
- POST /api/v1/auth/login - Login user
- GET /api/v1/auth/me - Get current user
- POST /api/v1/auth/forgotpassword - Forgot password
- PUT /api/v1/auth/resetpassword/:resettoken - Reset password
- PUT /api/v1/auth/updateprofile - Update profile
- PUT /api/v1/auth/updatepassword - Update password

### Cars

- GET /api/v1/cars - Get all cars
- GET /api/v1/cars/:id - Get single car
- POST /api/v1/cars - Create car (Admin)
- PUT /api/v1/cars/:id - Update car (Admin)
- DELETE /api/v1/cars/:id - Delete car (Admin)
- PUT /api/v1/cars/:id/photo - Upload car photo (Admin)
- PUT /api/v1/cars/:id/gallery - Upload car gallery images (Admin)

### Bookings

- GET /api/v1/bookings - Get all bookings (Admin)
- GET /api/v1/bookings/:id - Get single booking
- POST /api/v1/bookings - Create booking
- PUT /api/v1/bookings/:id - Update booking (Admin)
- DELETE /api/v1/bookings/:id - Delete booking (Admin)
- GET /api/v1/bookings/user - Get current user bookings
- PUT /api/v1/bookings/:id/cancel - Cancel booking

### Reviews

- GET /api/v1/reviews - Get all reviews
- GET /api/v1/cars/:carId/reviews - Get reviews for a car
- GET /api/v1/reviews/:id - Get single review
- POST /api/v1/cars/:carId/reviews - Add review
- PUT /api/v1/reviews/:id - Update review
- DELETE /api/v1/reviews/:id - Delete review

### Feedback

- GET /api/v1/feedback - Get all feedbacks (Admin)
- GET /api/v1/feedback/:id - Get single feedback
- POST /api/v1/feedback - Create feedback
- PUT /api/v1/feedback/:id - Update feedback (Admin)
- DELETE /api/v1/feedback/:id - Delete feedback (Admin)
- PUT /api/v1/feedback/:id/respond - Respond to feedback (Admin)
