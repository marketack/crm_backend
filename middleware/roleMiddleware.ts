import { Request, Response, NextFunction } from "express";

/**
 * 🛡️ Middleware: Check if User has Required Role
 */
export const authorizeRole = (allowedRoles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
      const userRoles = req.user.roles.map((role: any) => role.name);
      if (!allowedRoles.some(role => userRoles.includes(role))) {
        return res.status(403).json({ message: "Access denied. Insufficient permissions." });
      }
      next();
    };
  };
  