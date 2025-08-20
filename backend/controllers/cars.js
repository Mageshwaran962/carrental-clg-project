const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Car = require("../models/Car");

// @desc    Get all cars
// @route   GET /api/v1/cars
// @access  Public
exports.getCars = asyncHandler(async (req, res, next) => {
  console.log("Received query params:", req.query); // Debug log

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude from the filter query
  const removeFields = [
    "select",
    "sort",
    "page",
    "limit",
    "minPrice",
    "maxPrice",
  ];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Parse the base query
  let queryObject = JSON.parse(queryStr);

  // Handle price filtering separately
  if (req.query.minPrice || req.query.maxPrice) {
    queryObject.price = {};

    if (req.query.minPrice) {
      queryObject.price.$gte = parseInt(req.query.minPrice);
    }

    if (req.query.maxPrice) {
      queryObject.price.$lte = parseInt(req.query.maxPrice);
    }
  }

  // Finding resource
  console.log("Final query object:", queryObject); // Debug log
  let query = Car.find(queryObject);

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

  // Count total documents with the same filter
  const total = await Car.countDocuments(queryObject);

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const cars = await query;

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
    count: cars.length,
    pagination,
    data: cars,
  });
});

// @desc    Get single car
// @route   GET /api/v1/cars/:id
// @access  Public
exports.getCar = asyncHandler(async (req, res, next) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    return next(
      new ErrorResponse(`Car not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: car,
  });
});

// @desc    Create new car
// @route   POST /api/v1/cars
// @access  Private
exports.createCar = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const car = await Car.create(req.body);

  res.status(201).json({
    success: true,
    data: car,
  });
});

// @desc    Update car
// @route   PUT /api/v1/cars/:id
// @access  Private
exports.updateCar = asyncHandler(async (req, res, next) => {
  let car = await Car.findById(req.params.id);

  if (!car) {
    return next(
      new ErrorResponse(`Car not found with id of ${req.params.id}`, 404)
    );
  }

  car = await Car.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: car,
  });
});

// @desc    Delete car
// @route   DELETE /api/v1/cars/:id
// @access  Private
exports.deleteCar = asyncHandler(async (req, res, next) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    return next(
      new ErrorResponse(`Car not found with id of ${req.params.id}`, 404)
    );
  }

  await car.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Upload photo for car
// @route   PUT /api/v1/cars/:id/photo
// @access  Private
exports.uploadCarPhoto = asyncHandler(async (req, res, next) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    return next(
      new ErrorResponse(`Car not found with id of ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${car._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/cars/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Car.findByIdAndUpdate(req.params.id, { image: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});

// @desc    Upload gallery images for car
// @route   PUT /api/v1/cars/:id/gallery
// @access  Private
exports.uploadCarGallery = asyncHandler(async (req, res, next) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    return next(
      new ErrorResponse(`Car not found with id of ${req.params.id}`, 404)
    );
  }

  if (!req.files || !req.files.files) {
    return next(new ErrorResponse(`Please upload files`, 400));
  }

  const files = Array.isArray(req.files.files)
    ? req.files.files
    : [req.files.files];

  // Check if all files are images
  const allImages = files.every((file) => file.mimetype.startsWith("image"));
  if (!allImages) {
    return next(new ErrorResponse(`Please upload only image files`, 400));
  }

  // Check file sizes
  const allValidSize = files.every(
    (file) => file.size <= process.env.MAX_FILE_UPLOAD
  );
  if (!allValidSize) {
    return next(
      new ErrorResponse(
        `All images must be less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Process each file
  const fileNames = [];

  const uploadPromises = files.map((file, index) => {
    return new Promise((resolve, reject) => {
      // Create custom filename
      file.name = `gallery_${car._id}_${index}${path.parse(file.name).ext}`;
      fileNames.push(file.name);

      file.mv(`${process.env.FILE_UPLOAD_PATH}/cars/${file.name}`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  try {
    await Promise.all(uploadPromises);

    // Update the car with gallery images
    await Car.findByIdAndUpdate(req.params.id, { gallery: fileNames });

    res.status(200).json({
      success: true,
      data: fileNames,
    });
  } catch (err) {
    console.error(err);
    return next(new ErrorResponse(`Problem with file uploads`, 500));
  }
});
