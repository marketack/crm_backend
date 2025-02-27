import { Request, Response } from "express";
import User from "../models/user.model";
import ApiKey from "../models/apiKey.model";
import ActivityLog from "../models/activityLog.model";
import crypto from "crypto";

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().populate("roles badges");
    res.json({ message: "Users retrieved successfully", users }); // ✅ No return statement
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("roles badges");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ message: "User retrieved successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user;
    const { bio, avatar, settings } = req.body;

    const user = await User.findByIdAndUpdate(userId, { bio, avatar, settings }, { new: true });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


/**
 * Get User Activity Logs
 */
export const getUserActivityLogs = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    const logs = await ActivityLog.find({ userId }).sort({ createdAt: -1 });

    res.json({ message: "Activity logs retrieved successfully", logs });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Generate API Key for User
 */
export const generateApiKeyForUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    const apiKey = crypto.randomBytes(32).toString("hex");

    await ApiKey.create({ userId, key: apiKey, createdAt: new Date() });

    res.json({ message: "API Key generated successfully", apiKey });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Revoke API Key
 */
export const revokeApiKeyForUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    const { apiKey } = req.body;

    await ApiKey.findOneAndDelete({ userId, key: apiKey });

    res.json({ message: "API Key revoked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Deactivate User Account
 */
export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User account deactivated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Delete User (Admin Only)
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    await User.findByIdAndDelete(userId);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
