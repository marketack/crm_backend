import { Request, Response } from "express";
import { ActivityLog } from "../models/activityLog.model";
import mongoose from "mongoose";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
  };
}

/** ✅ Log User Activity */
export const logActivity = async (
  userId: string,
  userRole: string,
  action: string,
  targetType: string,
  targetId: string,
  details?: string,
  ipAddress?: string
) => {
  try {
    await ActivityLog.create({
      userId,
      userRole,
      action,
      targetType,
      targetId,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

/** ✅ Get All Activity Logs (Admin Only) */
export const getAllActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.roles.includes("admin")) {
      res.status(403).json({ message: "Unauthorized: Admin access required" });
      return;
    }

    const { targetType, action, userId, startDate, endDate, page = 1, limit = 10 } = req.query;
    const filter: Record<string, any> = {};

    if (targetType) filter.targetType = targetType;
    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    if (startDate && endDate) {
      filter.timestamp = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }

    const logs = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("userId", "name email");

    res.json({ message: "Activity logs retrieved successfully", logs });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ message: "Error fetching activity logs", error: error.message });
  }
};

/** ✅ Get Activity Logs by User */
export const getUserActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    const logs = await ActivityLog.find({ userId })
      .sort({ timestamp: -1 })
      .populate("userId", "name email");

    res.json({ message: "User activity logs retrieved successfully", logs });
  } catch (error) {
    console.error("Error fetching user activity logs:", error);
    res.status(500).json({ message: "Error fetching user activity logs", error: error.message });
  }
};

/** ✅ Get Activity Logs by Target Entity (Lead, Customer, etc.) */
export const getEntityActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { targetType, targetId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      res.status(400).json({ message: "Invalid entity ID" });
      return;
    }

    const logs = await ActivityLog.find({ targetType, targetId })
      .sort({ timestamp: -1 })
      .populate("userId", "name email");

    res.json({ message: "Entity activity logs retrieved successfully", logs });
  } catch (error) {
    console.error("Error fetching entity activity logs:", error);
    res.status(500).json({ message: "Error fetching entity activity logs", error: error.message });
  }
};

/** ✅ Delete Activity Logs (Admin Only) */
export const deleteActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.roles.includes("admin")) {
      res.status(403).json({ message: "Unauthorized: Admin access required" });
      return;
    }

    const { targetType, targetId } = req.query;
    const filter: Record<string, any> = {};

    if (targetType) filter.targetType = targetType;
    if (targetId) filter.targetId = targetId;

    await ActivityLog.deleteMany(filter);
    res.json({ message: "Activity logs deleted successfully" });
  } catch (error) {
    console.error("Error deleting activity logs:", error);
    res.status(500).json({ message: "Error deleting activity logs", error: error.message });
  }
};
