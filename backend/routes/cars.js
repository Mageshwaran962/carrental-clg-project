const express = require("express");
const router = express.Router();
const {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  uploadCarPhoto,
  uploadCarGallery,
} = require("../controllers/cars");

const { protect, authorize } = require("../middleware/auth");

// Include review router
const reviewRouter = require("./reviews");

// Re-route into review router
router.use("/:carId/reviews", reviewRouter);

router.route("/").get(getCars).post(protect, authorize("admin"), createCar);

router
  .route("/:id")
  .get(getCar)
  .put(protect, authorize("admin"), updateCar)
  .delete(protect, authorize("admin"), deleteCar);

router.route("/:id/photo").put(protect, authorize("admin"), uploadCarPhoto);

router.route("/:id/gallery").put(protect, authorize("admin"), uploadCarGallery);

module.exports = router;
