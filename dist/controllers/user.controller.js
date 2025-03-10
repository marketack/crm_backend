var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { Types } from "mongoose";
import User from "../models/user.model";
import Notification from "../models/notification.model";
import { sendNotification } from "../utils/websocket";
import ApiKey from "../models/apiKey.model";
import ActivityLog from "../models/activityLog.model";
import crypto from "crypto";
import Subscription from "../models/subscription.model";
/**
 * ✅ Convert String to ObjectId Safely
 */
const toObjectId = (id) => {
    return typeof id === "string" ? new Types.ObjectId(id) : id;
};
/**
 * ✅ Get User Profile by ID (From URL Params)
 */
export const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId || !Types.ObjectId.isValid(userId)) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }
        console.log(`📡 Fetching profile for User ID: ${userId}`);
        // Fetch user details with necessary population
        const user = yield User.findById(toObjectId(userId))
            .populate("roles", "name")
            .populate("company", "name industry location")
            .populate("transactions")
            .populate("notifications")
            .populate("messages.sender", "name email")
            .populate("loginHistory")
            .populate("subscriptionPlan")
            .lean();
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Exclude sensitive fields
        const { password, twoFactorSecret } = user, safeUserData = __rest(user, ["password", "twoFactorSecret"]);
        console.log("✅ Successfully retrieved user profile.");
        res.json(safeUserData);
    }
    catch (error) {
        console.error("❌ Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * 🔄 Securely Update User Profile
 */
export const updateUserProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId || !Types.ObjectId.isValid(userId)) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }
        const updates = req.body;
        // Prevent modification of sensitive fields
        const forbiddenFields = ["password", "roles", "isAdmin", "twoFactorSecret"];
        forbiddenFields.forEach((field) => {
            if (updates.hasOwnProperty(field)) {
                delete updates[field];
            }
        });
        // Update user profile
        const user = yield User.findByIdAndUpdate(toObjectId(userId), updates, { new: true }).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Log the profile update
        yield ActivityLog.create({
            userId: toObjectId(userId),
            action: "profile_update",
            details: "User updated profile settings",
            ip: req.ip,
            device: req.headers["user-agent"],
        });
        console.log("✅ Profile updated successfully.");
        res.json({ message: "Profile updated successfully", user });
    }
    catch (error) {
        console.error("❌ Error updating user profile:", error);
        next(error);
    }
});
/**
 * 📜 Get User Activity Logs
 */
export const getUserActivityLogs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }
        const logs = yield ActivityLog.find({ userId: toObjectId(userId) }).sort({ createdAt: -1 }).limit(50);
        res.json({ message: "Activity logs retrieved successfully", logs });
    }
    catch (error) {
        next(error);
    }
});
/**
 * 🔑 Generate API Key (Valid for 1 Year)
 */
export const generateApiKeyForUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }
        const apiKey = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        const newApiKey = yield ApiKey.create({ userId: toObjectId(userId), key: apiKey, createdAt: new Date(), expiresAt });
        res.json({ message: "API Key generated successfully", apiKey: newApiKey.key, expiresAt });
    }
    catch (error) {
        next(error);
    }
});
/**
 * 🚫 Revoke API Key
 */
export const revokeApiKeyForUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }
        const { apiKey } = req.body;
        yield ApiKey.findOneAndDelete({ userId: toObjectId(userId), key: apiKey });
        res.json({ message: "API Key revoked successfully" });
    }
    catch (error) {
        next(error);
    }
});
/**
 * 🛑 Deactivate User Account (Soft Delete)
 */
export const deactivateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }
        const user = yield User.findByIdAndUpdate(toObjectId(userId), { isActive: false, deactivatedAt: new Date() }, { new: true });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // ✅ Save Notification in Database
        const notification = yield Notification.create({
            userId: toObjectId(userId),
            title: "Account Deactivated",
            message: "Your account has been deactivated. Contact support if this was a mistake.",
            type: "warning",
            isRead: false,
            createdAt: new Date(),
        });
        sendNotification(userId, notification);
        res.json({ message: "User account deactivated", user });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ❌ Delete User (Admin Only, Soft Delete)
 */
export const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }
        const user = yield User.findByIdAndUpdate(toObjectId(userId), { isDeleted: true, deletedAt: new Date() }, { new: true });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // ✅ Save Notification in Database
        const notification = yield Notification.create({
            userId: toObjectId(userId),
            title: "Account Deleted",
            message: "An admin has deleted your account. Contact support if needed.",
            type: "error",
            isRead: false,
            createdAt: new Date(),
        });
        sendNotification(userId, notification);
        res.json({ message: "User deleted successfully (soft delete)", user });
    }
    catch (error) {
        next(error);
    }
});
export const getUserSubscriptionStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return; // ✅ Fix: Ensure function returns void
        }
        const activeSubscriptions = yield Subscription.find({ user: userId, status: "active" }).populate("saasTool");
        const expiredSubscriptions = yield Subscription.find({ user: userId, status: "expired" }).populate("saasTool");
        res.json({
            message: "User subscriptions retrieved!",
            activeSubscriptions,
            expiredSubscriptions,
        });
        return; // ✅ Fix: Ensure function returns void
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching subscriptions", error });
        return; // ✅ Fix: Ensure function returns void
    }
});
