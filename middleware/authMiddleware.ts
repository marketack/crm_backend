import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import redisClient from "../config/redis";
import User from "../models/user.model";

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * 🛡️ Extend Express Request Object to Include `user`
 */
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; email: string; roles: string[] };
    }
  }
}

/**
 * 🛡️ Middleware to Verify JWT Token
 * @swagger
 * /auth/protected:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Protected route example
 *     description: Requires authentication via JWT token.
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 */
export const verifyJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    if (!decoded.userId) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    // 🔴 Check if token is blacklisted (logout scenario)
    const isBlacklisted = await redisClient.get(`blacklist_${decoded.userId}_${token}`);
    if (isBlacklisted) {
      res.status(403).json({ message: "Token revoked. Please login again." });
      return;
    }

    // ✅ Fetch user with roles
    const user = await User.findById(decoded.userId).populate("roles");
    if (!user) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    // ✅ Attach user data to request
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles.map((role: any) => role.name),
    };

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * 🏆 Middleware to Restrict Access to Admins Only
 * @swagger
 * /admin/dashboard:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Admin-only route
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Forbidden
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.roles.includes("admin")) {
    res.status(403).json({ message: "Forbidden: Admin access required" });
    return;
  }
  next();
};

/**
 * 🛑 Middleware to Restrict Access to Specific Roles
 * @param roles Allowed roles (e.g. "admin", "instructor", "customer")
 * @swagger
 * /role/protected:
 *   get:
 *     security:
 *       - BearerAuth: []
 *     summary: Role-based protected route
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Forbidden
 */
export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized: No user found" });
      return;
    }

    try {
      // ✅ Fetch user roles dynamically from DB
      const user = await User.findById(req.user.userId).populate("roles");
      if (!user) {
        res.status(403).json({ message: "Forbidden: User not found" });
        return;
      }

      const userRoles = user.roles.map((role: any) => role.name);

      // ✅ Check if the user has at least one required role
      if (!roles.some((role) => userRoles.includes(role))) {
        res.status(403).json({ message: "Forbidden: Insufficient permissions" });
        return;
      }

      req.user.roles = userRoles;
      next();
    } catch (error) {
      console.error("Role Check Error:", error);
      res.status(500).json({ message: "Error checking user role", error });
    }
  };
};

/**
 * 🔄 Middleware to Restrict Self-Modification (Users Can't Modify Others)
 * @swagger
 * /user/update/{userId}:
 *   put:
 *     security:
 *       - BearerAuth: []
 *     summary: Restrict users from modifying other accounts
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Forbidden
 */
export const restrictSelfModification = (req: Request, res: Response, next: NextFunction): void => {
  const userIdFromToken = req.user?.userId; // Extract user ID from JWT token
  const userIdFromParams = req.params.userId; // Extract user ID from request params

  // ✅ Allow Admin Users to Modify Any User
  if (req.user?.roles.includes("admin")) {
    return next();
  }

  // 🛑 Restrict Users from Modifying Other Users
  if (userIdFromToken !== userIdFromParams) {
    res.status(403).json({ message: "Forbidden: You can only modify your own account" });
    return; // ✅ Ensure function stops here
  }

  // ✅ Allow Self-Modification
  next();
};
