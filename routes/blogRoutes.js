const express = require("express");
const router = express.Router();
const {
  createBlog,
  getBlogs,
  getBlogBySlug,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { upload } = require("../config/multer");

// Public routes (get published blogs)
router.get("/", getBlogs);
router.get("/:slug", getBlogBySlug);

// Protected admin routes
router.post("/", protect, adminOnly, createBlog);
router.get("/id/:id", protect, adminOnly, getBlogById);
router.put("/:id", protect, adminOnly, updateBlog);
router.delete("/:id", protect, adminOnly, deleteBlog);

// Dedicated image upload endpoint (separate from blog creation)
router.post("/upload", protect, adminOnly, upload.single("coverImage"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No image file uploaded" });
  }
  const imageUrl = `/uploads/blogs/${req.file.filename}`;
  res.json({ success: true, url: imageUrl });
});

module.exports = router;
