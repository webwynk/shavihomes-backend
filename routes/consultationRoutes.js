const express = require("express");
const router = express.Router();
const { 
  createConsultation, 
  getConsultations, 
  updateConsultationStatus, 
  deleteConsultation,
  respondToConsultation 
} = require("../controllers/consultationController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Route for handling consultation submissions (Public)
router.post("/", createConsultation);

// Route for fetching all consultations (Admin only, protected by JWT)
router.get("/", protect, adminOnly, getConsultations);

// Route for updating consultation status (Admin only)
router.put("/:id/status", protect, adminOnly, updateConsultationStatus);

// Route for responding to consultation (Admin only)
router.post("/:id/respond", protect, adminOnly, respondToConsultation);

// Route for deleting a consultation (Admin only)
router.delete("/:id", protect, adminOnly, deleteConsultation);

module.exports = router;
