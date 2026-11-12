require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const multer = require("multer");
const connectDB = require("./config/db");
const { getJwtSecret } = require("./config/jwt");
const consultationRoutes = require("./routes/consultationRoutes");
const authRoutes = require("./routes/authRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const blogRoutes = require("./routes/blogRoutes");

// Fail fast in production if JWT_SECRET is missing
getJwtSecret();

const app = express();
const PORT = process.env.PORT || 5000;

const DEFAULT_CORS_ORIGINS = [
  "https://shavihomes.com",
  "https://www.shavihomes.com",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:5173",
];

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : DEFAULT_CORS_ORIGINS;

// Connect to Database
connectDB();

// Middleware
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const err = new Error("Not allowed by CORS");
      err.status = 403;
      return callback(err);
    },
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("dev"));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/consultations", consultationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/blogs", blogRoutes);

// Root route (for health check)
app.get("/", (req, res) => {
  res.send("Shavi Homes API is running...");
});

// Global JSON error handler (handles Multer, CORS, and unexpected errors)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err && err.message && err.message.includes("Only image files")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  const status = err && err.status ? err.status : 500;
  if (status >= 500) {
    console.error("Unhandled error:", err);
  }
  return res.status(status).json({
    success: false,
    message: status >= 500 ? "Server error" : err.message,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
