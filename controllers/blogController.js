const { z } = require("zod");
const Blog = require("../models/Blog");
const fs = require("fs");
const path = require("path");

// Validation Schema (coverImage is optional here since it comes from file upload)
const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  author: z.string().min(1, "Author is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  coverImage: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(["Draft", "Published"]).optional(),
});

// @desc    Create new blog post
// @route   POST /api/blogs
// @access  Private (Admin)
const createBlog = async (req, res) => {
  try {
    const validatedData = blogSchema.parse(req.body);

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug: validatedData.slug });
    if (existingBlog) {
      // Delete uploaded file if blog creation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: "A blog with this slug already exists"
      });
    }

    // Handle cover image - use uploaded file or provided URL
    let coverImage = validatedData.coverImage;
    if (req.file) {
      coverImage = `/uploads/blogs/${req.file.filename}`;
    }

    if (!coverImage) {
      return res.status(400).json({
        success: false,
        message: "Cover image is required"
      });
    }

    const newBlog = new Blog({
      ...validatedData,
      coverImage,
      publishedAt: validatedData.status === "Published" ? new Date() : null,
    });

    await newBlog.save();

    res.status(201).json({
      success: true,
      message: "Blog post created successfully.",
      data: newBlog,
    });
  } catch (error) {
    // Delete uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error("Server error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all blog posts (Admin - all, Public - only published)
// @route   GET /api/blogs
// @access  Public/Private
const getBlogs = async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;

    let query = {};

    // If no auth token or not admin, only show published blogs
    if (!req.user || req.user.role !== "admin") {
      query.status = "Published";
    } else if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get single blog post by slug
// @route   GET /api/blogs/:slug
// @access  Public/Private
const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    let query = { slug };

    // If no auth token or not admin, only show published blogs
    if (!req.user || req.user.role !== "admin") {
      query.status = "Published";
    }

    const blog = await Blog.findOne(query);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    res.json({ success: true, data: blog });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get single blog post by ID (Admin only)
// @route   GET /api/blogs/id/:id
// @access  Private (Admin)
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    res.json({ success: true, data: blog });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update blog post
// @route   PUT /api/blogs/:id
// @access  Private (Admin)
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Get existing blog to handle old image deletion
    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    // If status is changing to Published and no publishedAt date, set it
    if (updateData.status === "Published" && existingBlog.status !== "Published") {
      updateData.publishedAt = new Date();
    }

    // Handle cover image update
    if (req.file) {
      // Delete old image if it exists and is a local file
      if (existingBlog.coverImage && existingBlog.coverImage.startsWith("/uploads/")) {
        const oldImagePath = path.join(__dirname, "..", existingBlog.coverImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.coverImage = `/uploads/blogs/${req.file.filename}`;
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Blog post updated successfully.",
      data: blog,
    });
  } catch (error) {
    // Delete uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Update error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete blog post
// @route   DELETE /api/blogs/:id
// @access  Private (Admin)
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    // Delete associated image if it's a local file
    if (blog.coverImage && blog.coverImage.startsWith("/uploads/")) {
      const imagePath = path.join(__dirname, "..", blog.coverImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ success: true, message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createBlog,
  getBlogs,
  getBlogBySlug,
  getBlogById,
  updateBlog,
  deleteBlog,
};
