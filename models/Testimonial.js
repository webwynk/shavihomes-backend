const mongoose = require("mongoose");

const TestimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Client name is required"],
    trim: true,
  },
  role: {
    type: String,
    required: [true, "Role or project type is required"],
    trim: true,
  },
  text: {
    type: String,
    required: [true, "Testimonial content is required"],
    trim: true,
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: 1,
    max: 5,
    default: 5,
  },
  image: {
    type: String,
    default: "https://i.ibb.co/4pGMZzv/default-avatar.png", // Default avatar URL
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Testimonial", TestimonialSchema);
