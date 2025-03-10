import { Request, Response, NextFunction } from "express";
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
const toObjectId = (id: string | Types.ObjectId): Types.ObjectId => {
  return typeof id === "string" ? new Types.ObjectId(id) : id;
};

/**
 * ✅ Get User Profile by ID (From URL Params)
 */
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    console.log(`📡 Fetching profile for User ID: ${userId}`);

    // Fetch user details with necessary population
    const user = await User.findById(userId)
      .populate<{ role: { _id: Types.ObjectId; name: string } | null }>("role", "name") // ✅ Ensure `role` is populated
      .populate("company", "name industry location")
      .populate("transactions")
      .populate("notifications")
      .populate("messages.sender", "name email")
      .populate("loginHistory")
      .populate("subscriptionPlan");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // ✅ Ensure `roles` is always an array and formatted correctly
    const userRoles = user.role
      ? Array.isArray(user.role)
        ? user.role.map((r) => r.name)
        : [user.role.name]
      : ["customer"];

    // Exclude sensitive fields
    const { password, twoFactorSecret, ...safeUserData } = user.toObject(); // ✅ Convert Mongoose Document to Plain Object

    console.log("✅ Successfully retrieved user profile.");
    res.json({ ...safeUserData, roles: userRoles }); // ✅ Always return `roles`
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 🔄 Securely Update User Profile
 */
export const updateUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    const user = await User.findByIdAndUpdate(toObjectId(userId), updates, { new: true }).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Log the profile update
    await ActivityLog.create({
      userId: toObjectId(userId),
      action: "profile_update",
      details: "User updated profile settings",
      ip: req.ip,
      device: req.headers["user-agent"],
    });

    console.log("✅ Profile updated successfully.");
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("❌ Error updating user profile:", error);
    next(error);
  }
};


/**
 * 📜 Get User Activity Logs
 */
export const getUserActivityLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    const logs = await ActivityLog.find({ userId: toObjectId(userId) }).sort({ createdAt: -1 }).limit(50);

    res.json({ message: "Activity logs retrieved successfully", logs });
  } catch (error) {
    next(error);
  }
};

/**
 * 🔑 Generate API Key (Valid for 1 Year)
 */
export const generateApiKeyForUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    const apiKey = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const newApiKey = await ApiKey.create({ userId: toObjectId(userId), key: apiKey, createdAt: new Date(), expiresAt });

    res.json({ message: "API Key generated successfully", apiKey: newApiKey.key, expiresAt });
  } catch (error) {
    next(error);
  }
};

/**
 * 🚫 Revoke API Key
 */
export const revokeApiKeyForUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    const { apiKey } = req.body;
    await ApiKey.findOneAndDelete({ userId: toObjectId(userId), key: apiKey });

    res.json({ message: "API Key revoked successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * 🛑 Deactivate User Account (Soft Delete)
 */
export const deactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    const user = await User.findByIdAndUpdate(
      toObjectId(userId),
      { isActive: false, deactivatedAt: new Date() },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // ✅ Save Notification in Database
    const notification = await Notification.create({
      userId: toObjectId(userId),
      title: "Account Deactivated",
      message: "Your account has been deactivated. Contact support if this was a mistake.",
      type: "warning",
      isRead: false,
      createdAt: new Date(),
    });

    sendNotification(userId, notification);

    res.json({ message: "User account deactivated", user });
  } catch (error) {
    next(error);
  }
};

/**
 * ❌ Delete User (Admin Only, Soft Delete)
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    const user = await User.findByIdAndUpdate(
      toObjectId(userId),
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // ✅ Save Notification in Database
    const notification = await Notification.create({
      userId: toObjectId(userId),
      title: "Account Deleted",
      message: "An admin has deleted your account. Contact support if needed.",
      type: "error",
      isRead: false,
      createdAt: new Date(),
    });

    sendNotification(userId, notification);

    res.json({ message: "User deleted successfully (soft delete)", user });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscriptionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return; // ✅ Fix: Ensure function returns void
    }

    const activeSubscriptions = await Subscription.find({ user: userId, status: "active" }).populate("saasTool");
    const expiredSubscriptions = await Subscription.find({ user: userId, status: "expired" }).populate("saasTool");

    res.json({
      message: "User subscriptions retrieved!",
      activeSubscriptions,
      expiredSubscriptions,
    });
    return; // ✅ Fix: Ensure function returns void
  } catch (error) {
    res.status(500).json({ message: "Error fetching subscriptions", error });
    return; // ✅ Fix: Ensure function returns void
  }
};