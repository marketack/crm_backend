
import { Request, Response } from "express";
import mongoose, { FilterQuery } from "mongoose";
import Notification, { INotification } from "../models/notification.model";
import { sendNotification } from "../server"; // WebSocket Function


/**
 * ✅ Mark Notification as Read (Fixed Version)
 */
export const markAsRead = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const updatedNotification: INotification | null = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: { isRead: true } },
      { new: true, runValidators: true }
    ).exec();

    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification marked as read", updatedNotification });
  } catch (error) {
    console.error("❌ Error updating notification:", error);
    res.status(500).json({ message: "Error updating notification" });
  }
};

/**
 * 📥 Get All Notifications for a User
 */
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find({ userId: req.user?.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};



/**
 * 🚀 Create & Send a Notification
 */
export const createNotification = async (userId: string, title: string, message: string, type: "info" | "warning" | "error") => {
  try {
    const notification = new Notification({ userId, title, message, type });
    await notification.save();

    // Send Notification via WebSocket
    sendNotification(userId, notification);
  } catch (error) {
    console.error("❌ Error creating notification:", error);
  }
};
