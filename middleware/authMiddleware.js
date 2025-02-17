const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User"); // Ensure User model exists

// Middleware to protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      console.log("Authenticated User:", req.user); // 🔍 Debug Log

      if (!req.user) {
        res.status(401);
        throw new Error("User not found");
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, invalid token");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }
});

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role && req.user.role.toLowerCase() === "admin") {
    next();
  } else {
    console.log("❌ Admin Check Failed. User Role:", req.user?.role); // Debug log
    res.status(403);
    throw new Error("Not authorized as admin");
  }
};

exports.verifyToken = (roles = []) => (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });

    // Check roles
    if (roles.length && !roles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden - Insufficient privileges" });
    }

    req.user = user;
    next();
  });
};

// **Ensure proper exports**
module.exports = { protect, isAdmin };
