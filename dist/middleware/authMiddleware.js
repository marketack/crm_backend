var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt from "jsonwebtoken";
import redisClient from "../config/redis";
import User from "../models/user.model";
export const verifyJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.userId) {
            return res.status(401).json({ message: "Invalid token" });
        }
        // 🔴 Check if token is blacklisted
        const isBlacklisted = yield redisClient.get(`blacklist_${decoded.userId}_${token}`);
        if (isBlacklisted) {
            return res.status(403).json({ message: "Token revoked. Please login again." });
        }
        // ✅ Fetch user with roles
        const user = yield User.findById(decoded.userId)
            .populate({
            path: "roles",
            populate: {
                path: "permissions",
                model: "Permission",
                select: "name",
            },
        })
            .lean();
        if (!user) {
            return res.status(401).json({ message: "Invalid token" });
        }
        // Extract role names
        const roleNames = user.roles.map((role) => role.name);
        // Retrieve permissions from roles
        const rolePermissions = new Set(user.roles.flatMap((role) => role.permissions.map((perm) => perm.name)));
        // ✅ Attach user data to request
        req.user = {
            userId: user._id.toString(),
            email: user.email,
            roles: roleNames,
            permissions: Array.from(rolePermissions), // ✅ Store only permissions
        };
        next();
    }
    catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
});
/**
 * ✅ Middleware to Restrict Access to Admins Only
 */
export const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.roles.includes("admin")) {
        res.status(403).json({ message: "Forbidden: Admin access required" });
        return;
    }
    next();
};
/**
 * ✅ Middleware to Check User Roles
 */
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized: No user found" });
            return;
        }
        if (!roles.some((role) => req.user.roles.includes(role))) {
            res.status(403).json({ message: "Forbidden: Insufficient role access" });
            return;
        }
        next();
    };
};
export const requirePermission = (requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized: No user found" });
            return;
        }
        if (!req.user.permissions || !Array.isArray(req.user.permissions)) {
            req.user.permissions = [];
        }
        if (!requiredPermissions.some((perm) => req.user.permissions.includes(perm))) {
            res.status(403).json({ message: "Forbidden: Insufficient permissions" });
            return;
        }
        next();
    };
};
