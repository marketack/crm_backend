const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// ✅ Middleware to authenticate user
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Populate role & permissions dynamically
      req.user = await User.findById(decoded.id)
        .populate("role") // Fetch role details
        .populate("permissions"); // Fetch custom permissions

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      console.log("✅ Authenticated User:", req.user);
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
});

// ✅ Middleware to check if user is an admin
exports.isAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.role || req.user.role.name.toLowerCase() !== "admin") {
    console.log("❌ Admin Check Failed. User Role:", req.user?.role?.name);
    return res.status(403).json({ message: "Not authorized as admin" });
  }
  next();
});

// ✅ Super Admin Middleware
exports.superAdminOnly = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role.name !== "Super Admin") {
    return res.status(403).json({ message: "Forbidden, only Super Admin can perform this action" });
  }
  next();
});

// ✅ Admin Middleware
exports.adminOnly = asyncHandler(async (req, res, next) => {
  if (!req.user || !["Admin", "Super Admin"].includes(req.user.role.name)) {
    return res.status(403).json({ message: "Forbidden, only Admins can perform this action" });
  }
  next();
});

// ✅ Role-Based Middleware (For Specific Roles)
exports.hasRole = (roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role.name)) {
      return res.status(403).json({ message: `Access Denied: Requires ${roles.join(" or ")}` });
    }
    next();
  });
};

// ✅ Permission-Based Middleware
exports.hasPermission = (requiredPermission) => {
  return asyncHandler(async (req, res, next) => {
    const userPermissions = req.user.permissions.map((perm) => perm.name);

    console.log(`🔍 Checking permission: ${requiredPermission}`);
    console.log(`✅ User Permissions: ${userPermissions.join(", ")}`);

    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({ message: `Forbidden, missing permission: ${requiredPermission}` });
    }

    next();
  });
};

// ✅ Verify Token with Role Check
exports.verifyToken = (roles = []) => asyncHandler(async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).populate("role").populate("permissions");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ Check if user has one of the required roles
    if (roles.length && !roles.includes(req.user.role.name)) {
      return res.status(403).json({ message: `Forbidden - Requires ${roles.join(" or ")}` });
    }

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid Token" });
  }
});
