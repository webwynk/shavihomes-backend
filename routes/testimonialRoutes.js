const express = require("express");
const router = express.Router();
const { 
  getTestimonials, 
  createTestimonial, 
  updateTestimonial, 
  deleteTestimonial 
} = require("../controllers/testimonialController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Route for fetching all testimonials (Public)
router.get("/", getTestimonials);

// Routes for creating, updating, and deleting (Protected)
router.post("/", protect, adminOnly, createTestimonial);
router.put("/:id", protect, adminOnly, updateTestimonial);
router.delete("/:id", protect, adminOnly, deleteTestimonial);

module.exports = router;
