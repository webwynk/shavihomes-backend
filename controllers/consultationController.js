const { z } = require("zod");
const Consultation = require("../models/Consultation");
const { sendConsultationEmail, sendResponseEmail } = require("../utils/sendEmail");

// Validation Schema
const consultationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  type: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().optional(),
  source: z.string().optional(),
});

// @desc    Create new consultation
// @route   POST /api/consultations
// @access  Public
const createConsultation = async (req, res) => {
  try {
    const validatedData = consultationSchema.parse(req.body);
    const newConsultation = new Consultation(validatedData);
    await newConsultation.save();

    // Trigger Email Notification (Asynchronous)
    sendConsultationEmail(validatedData);

    res.status(201).json({
      success: true,
      message: "Consultation request saved successfully.",
      data: newConsultation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error("Server error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all consultations
// @route   GET /api/consultations
// @access  Private (Admin)
const getConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: consultations });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update consultation status
// @route   PUT /api/consultations/:id/status
// @access  Private (Admin)
const updateConsultationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Completed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!consultation) {
      return res.status(404).json({ success: false, message: "Consultation not found" });
    }

    res.json({ success: true, data: consultation });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete a consultation
// @route   DELETE /api/consultations/:id
// @access  Private (Admin)
const deleteConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndDelete(req.params.id);

    if (!consultation) {
      return res.status(404).json({ success: false, message: "Consultation not found" });
    }

    res.json({ success: true, message: "Consultation deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Respond to lead via email
// @route   POST /api/consultations/:id/respond
// @access  Private (Admin)
const respondToConsultation = async (req, res) => {
  try {
    const { message, subject } = req.body;
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({ success: false, message: "Consultation not found" });
    }

    if (!consultation.email) {
      return res.status(400).json({ success: false, message: "This lead has no associated email address." });
    }

    // Send the email using Admin Context
    await sendResponseEmail({
      to: consultation.email,
      subject: subject || `Response to your inquiry - Shavi Homes`,
      message,
      adminEmail: req.user.email,
      adminName: req.user.name || "Admin",
    });

    res.json({ success: true, message: "Response sent successfully to " + consultation.email });
  } catch (error) {
    console.error("Response error:", error);
    res.status(500).json({ success: false, message: "Failed to send email response" });
  }
};

module.exports = {
  createConsultation,
  getConsultations,
  updateConsultationStatus,
  deleteConsultation,
  respondToConsultation,
};
