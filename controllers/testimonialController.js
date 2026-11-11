const Testimonial = require("../models/Testimonial");
const { z } = require("zod");

// Validation Schema
const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  text: z.string().min(1, "Content is required"),
  rating: z.number().min(1).max(5).default(5),
  image: z.string().optional(),
});

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json({ success: true, data: testimonials });
  } catch (error) {
    console.error("Fetch testimonials error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Create a new testimonial
// @route   POST /api/testimonials
// @access  Private (Admin)
const createTestimonial = async (req, res) => {
  try {
    const validatedData = testimonialSchema.parse(req.body);
    const newTestimonial = new Testimonial(validatedData);
    await newTestimonial.save();

    res.status(201).json({
      success: true,
      message: "Testimonial created successfully.",
      data: newTestimonial,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error("Create testimonial error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Private (Admin)
const updateTestimonial = async (req, res) => {
  try {
    const validatedData = testimonialSchema.partial().parse(req.body);
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true }
    );

    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    res.json({ success: true, data: testimonial });
  } catch (error) {
    console.error("Update testimonial error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private (Admin)
const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    res.json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error) {
    console.error("Delete testimonial error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
