const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getJwtSecret } = require("../config/jwt");

/** Extract a Bearer token from the Authorization header, if present. */
function extractBearerToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice(7).trim();
  return token || null;
}

/** Return true when the user holds an administrative role. */
function isAdminUser(user) {
  return Boolean(user && (user.role === "admin" || user.role === "super-admin"));
}

const protect = async (req, res, next) => {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Not authorized, user not found" });
    }
    req.user = user;
    return next();
  } catch (error) {
    console.error("Token Error:", error);
    return res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};

/** Attach req.user when a valid Bearer token is provided; otherwise continue anonymously. */
const optionalProtect = async (req, res, next) => {
  const token = extractBearerToken(req);
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
    }
  } catch {
    // Public routes proceed unauthenticated when token is invalid or expired.
  }

  return next();
};

const adminOnly = (req, res, next) => {
  if (isAdminUser(req.user)) {
    return next();
  }
  return res.status(401).json({ success: false, message: "Not authorized as an admin" });
};

module.exports = { protect, optionalProtect, adminOnly, isAdminUser };
