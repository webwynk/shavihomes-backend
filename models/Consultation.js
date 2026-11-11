const mongoose = require("mongoose");

const ConsultationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    trim: true,
  },
  budget: {
    type: String,
    trim: true,
  },
  message: {
    type: String,
    trim: true,
  },
  source: {
    type: String,
    trim: true,
    default: "Unknown",
  },
  status: {
    type: String,
    trim: true,
    enum: ["Pending", "Completed"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Consultation", ConsultationSchema);
