import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user.model";

/**
 * 🛡️ Extend Express Request Object to Include `user`
 */
/**
 * 🛡️ Extend Express Request Object to Include `company`
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        roles: string[];
        company?: string; // ✅ Fix: Ensure `company` is included in req.user
      };
    }
  }
}


/**
 * 🛡️ Middleware to Verify JWT Token & Attach User to Request
 */
export const verifyJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    if (!decoded.userId) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    // ✅ Fetch user with company populated
    const user = await User.findById(decoded.userId)
      .populate("role", "name")
      .populate("company", "_id name")
      .lean();

    if (!user) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    // ✅ Ensure `role` is correctly assigned
    const userRole = user.role && typeof user.role === "object" && "name" in user.role ? user.role.name : "customer";

    // ✅ Attach `company` to req.user
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      roles: [userRole],
      company: user.company?._id.toString() || null, // ✅ Ensure company is included
    };

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};


/**
 * 🏆 Middleware to Restrict Access to Admins Only
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
 * @param roles Allowed roles (e.g. "admin", "manager", "employee")
 */
export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized: No user found" });
      return;
    }

    try {
      // ✅ Check if the user has at least one required role
      if (!roles.some((role) => req.user!.roles.includes(role))) {
        res.status(403).json({ message: "Forbidden: Insufficient permissions" });
        return;
      }

      next();
    } catch (error) {
      console.error("Role Check Error:", error);
      res.status(500).json({ message: "Error checking user role", error });
    }
  };
};

/**
 * 🔄 Middleware to Restrict Self-Modification (Users Can't Modify Others)
 */
export const restrictSelfModification = (req: Request, res: Response, next: NextFunction): void => {
  const userIdFromToken = req.user?.userId;
  const userIdFromParams = req.params.userId;
  const userIdFromBody = req.body.userId; // ✅ Allow checking `userId` in the request body

  // ✅ Allow Admin Users to Modify Any User
  if (req.user?.roles.includes("admin")) {
    return next();
  }

  // 🛑 Restrict Users from Modifying Other Users
  if (userIdFromToken !== userIdFromParams && userIdFromToken !== userIdFromBody) {
    res.status(403).json({ message: "Forbidden: You can only modify your own account" });
    return;
  }

  next();
};

/**
 * 🏢 Middleware to Restrict Actions to Users in the Same Company
 */
export const requireSameCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const targetUser = await User.findById(userId).populate("company", "_id");
    if (!targetUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // ✅ Allow Admin Users to Modify Any User
    if (req.user?.roles.includes("admin")) {
      return next();
    }

    // ✅ Ensure the target user belongs to the same company
    if (req.user?.company !== targetUser.company?._id.toString()) {
      res.status(403).json({ message: "Forbidden: You do not belong to the same company" });
      return;
    }

    next();
  } catch (error) {
    console.error("Company Check Error:", error);
    res.status(500).json({ message: "Error checking company permissions", error });
  }
};
