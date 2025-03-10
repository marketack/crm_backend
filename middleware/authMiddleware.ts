import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import asyncHandler from "express-async-handler"; // ✅ Async error handling wrapper
import mongoose from "mongoose";
import User from "../models/user.model";

/**
 * ✅ Utility function to safely extract user role & company
 */
const extractRoleAndCompany = (user: any) => {
  const userRole =
    user.role && typeof user.role === "object" && "name" in user.role
      ? (user.role as { name: string }).name
      : "customer"; // Default role

  const userCompany =
    user.company && typeof user.company === "object" && "_id" in user.company
      ? user.company._id.toString()
      : null; // Default to `null`

  return { userRole, userCompany };
};

/**
 * ✅ Middleware: Verify JWT and attach user info to req
 */
export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      if (!decoded.userId) {
        res.status(401).json({ message: "Invalid token" });
        return;
      }

      const user = await User.findById(decoded.userId)
        .populate("role", "name")
        .populate("company", "_id name")
        .lean();

      if (!user) {
        res.status(401).json({ message: "Invalid token" });
        return;
      }

      const { userRole, userCompany } = extractRoleAndCompany(user);

      (req as any).user = {
        userId: user._id.toString(),
        email: user.email,
        roles: [userRole],
        company: userCompany,
      };

      next();
    } catch (error) {
      console.error("JWT Verification Error:", error);
      res.status(401).json({ message: "Invalid or expired token" });
    }
  }
);

/**
 * ✅ Middleware: Restrict access to Admins only
 */
export const requireAdmin = asyncHandler((req: Request, res: Response, next: NextFunction): void => {
  if (!(req as any).user || !(req as any).user.roles.includes("admin")) {
    res.status(403).json({ message: "Forbidden: Admin access required" });
    return;
  }
  next();
});

/**
 * ✅ Middleware: Restrict access based on user roles
 */
export const requireRole = (roles: string[]) =>
  asyncHandler((req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized: No user found" });
      return;
    }

    if (!roles.some((role) => user.roles.includes(role))) {
      res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      return;
    }

    next();
  });

/**
 * ✅ Middleware: Restrict modifications to self (unless Admin)
 */
export const restrictSelfModification = asyncHandler((req: Request, res: Response, next: NextFunction): void => {
  const userIdFromToken = (req as any).user?.userId;
  const userIdFromParams = req.params.userId;
  const userIdFromBody = req.body.userId;

  // ✅ Allow Admins to modify any user
  if ((req as any).user?.roles.includes("admin")) {
    return next();
  }

  // 🛑 Restrict non-admin users from modifying other users
  if (userIdFromToken !== userIdFromParams && userIdFromToken !== userIdFromBody) {
    res.status(403).json({ message: "Forbidden: You can only modify your own account" });
    return;
  }

  next();
});

/**
 * ✅ Middleware: Restrict actions to users within the same company
 */
export const requireSameCompany = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }

      const targetUser = await User.findById(userId).populate("company", "_id").lean();
      if (!targetUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if ((req as any).user?.roles.includes("admin")) {
        return next();
      }

      if (!(req as any).user?.company || (req as any).user.company !== targetUser.company?._id.toString()) {
        res.status(403).json({ message: "Forbidden: You do not belong to the same company" });
        return;
      }

      next();
    } catch (error) {
      console.error("Company Check Error:", error);
      res.status(500).json({ message: "Error checking company permissions" });
    }
  }
);
