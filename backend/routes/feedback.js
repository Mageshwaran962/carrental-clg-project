const express = require("express");
const router = express.Router();
const {
  createFeedback,
  getFeedbacks,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  respondToFeedback,
} = require("../controllers/feedback");

const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(protect, authorize("admin"), getFeedbacks)
  .post(protect, createFeedback);

router
  .route("/:id")
  .get(protect, getFeedback)
  .put(protect, authorize("admin"), updateFeedback)
  .delete(protect, authorize("admin"), deleteFeedback);

router
  .route("/:id/respond")
  .put(protect, authorize("admin"), respondToFeedback);

module.exports = router;
