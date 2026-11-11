const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, "Slug is required"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  author: {
    type: String,
    required: [true, "Author is required"],
    trim: true,
  },
  content: {
    type: String,
    required: [true, "Content is required"],
  },
  excerpt: {
    type: String,
    required: [true, "Excerpt is required"],
    trim: true,
  },
  coverImage: {
    type: String,
    required: [true, "Cover image is required"],
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true,
    default: "General",
  },
  status: {
    type: String,
    enum: ["Draft", "Published"],
    default: "Draft",
  },
  publishedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on each save
BlogSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

// Generate slug from title if not provided
BlogSchema.pre("save", function () {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

module.exports = mongoose.model("Blog", BlogSchema);
