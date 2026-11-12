const { z } = require("zod");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getJwtSecret } = require("../config/jwt");

const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Valid email is required").trim().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "super-admin"]).optional(),
});

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").trim().optional(),
  email: z.string().email("Valid email is required").trim().toLowerCase().optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
});

const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: "30d",
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user && (await user.matchPassword(password))) {
      return res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0]?.message || "Invalid input", errors: error.errors });
    }
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Private (Admin)
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = registerSchema.parse(req.body);
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    return res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0]?.message || "Invalid user data", errors: error.errors });
    }
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, password } = updateProfileSchema.parse(req.body);
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        return res.status(400).json({ success: false, message: "Email is already in use" });
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    if (password) {
      user.password = password;
    }

    const updatedUser = await user.save();

    return res.json({
      success: true,
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0]?.message || "Invalid profile data", errors: error.errors });
    }
    console.error("Update profile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all admins
// @route   GET /api/auth/admins
// @access  Private (Admin)
const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ["admin", "super-admin"] } }).select("-password");
    return res.json({ success: true, data: admins });
  } catch (error) {
    console.error("Get admins error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  loginUser,
  registerUser,
  updateUserProfile,
  getAdmins,
};
