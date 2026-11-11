const express = require("express");
const router = express.Router();
const { loginUser, registerUser, updateUserProfile, getAdmins } = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Route for logging in
router.post("/login", loginUser);

// Route for registering a new admin (Public for now to create the first admin?)
// Actually, I'll seed the first admin then protect this.
router.post("/register", protect, adminOnly, registerUser);

// Route for getting and updating current user profile
router.route("/profile")
  .get(protect, (req, res) => res.json({ success: true, user: req.user }))
  .put(protect, updateUserProfile);

// Route for getting all admins
router.get("/admins", protect, adminOnly, getAdmins);

module.exports = router;
