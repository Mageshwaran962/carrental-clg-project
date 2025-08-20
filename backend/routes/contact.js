const express = require("express");
const router = express.Router();
const { submitContactForm } = require("../controllers/contact");

// @route   POST /api/v1/contact
// @desc    Submit contact form
// @access  Public
router.post("/", submitContactForm);

module.exports = router;
