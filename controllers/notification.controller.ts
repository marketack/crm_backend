import { Request, Response, NextFunction } from "express";
import mongoose, { Types } from "mongoose";
import Notification from "../models/notification.model";
import User from "../models/user.model";


// Convert String to ObjectId safely
const toObjectId = (id: string | Types.ObjectId): Types.ObjectId => {
  return new mongoose.Types.ObjectId(id);
};

// Fix: Ensure `userId` is converted properly
export const createNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, title, message, type } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    const newNotification = new Notification({
      userId: toObjectId(userId), // ✅ Convert to ObjectId
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date(),
    });

    await newNotification.save();
    res.status(201).json({ success: true, message: "Notification created successfully", notification: newNotification });
  } catch (error) {
    next(error);
  }
};


/**
 * ✅ Get All Notifications (Users get their own, Admins get all)
 * @route GET /notifications
 */
export const getUserNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req as any; // ✅ Cast to avoid TypeScript errors
    const userId = user.user?.userId;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ message: "User notifications retrieved", notifications });
  } catch (error) {
    next(error);
  }
};



/**
 * ✅ Get Notification by ID
 * @route GET /notifications/:id
 */
export const getNotificationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid notification ID" });
      return;
    }

    const notification = await Notification.findById(toObjectId(id));

    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    res.status(200).json({ message: "Notification retrieved successfully", notification });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Mark Single or Multiple Notifications as Read
 * @route PATCH /notifications/read
 */
export const markNotificationAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      res.status(400).json({ message: "Invalid notification IDs" });
      return;
    }

    // Convert IDs to ObjectId & Validate
    const validIds = notificationIds.filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => toObjectId(id));
    
    if (validIds.length === 0) {
      res.status(400).json({ message: "No valid notification IDs provided" });
      return;
    }

    // Update notifications
    const result = await Notification.updateMany(
      { _id: { $in: validIds } },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!result.modifiedCount) {
      res.status(404).json({ message: "No notifications updated. They might already be read or do not exist." });
      return;
    }

    res.status(200).json({ message: "Notifications marked as read", updatedCount: result.modifiedCount });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Update a Notification (Title & Message)
 * @route PATCH /notifications/:id
 */
export const updateNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid notification ID" });
      return;
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
      toObjectId(id),
      { $set: { title, message } },
      { new: true }
    );

    if (!updatedNotification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    res.status(200).json({ message: "Notification updated successfully", notification: updatedNotification });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Delete Single or Multiple Notifications
 * @route DELETE /notifications
 */
export const deleteNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      res.status(400).json({ message: "Invalid notification IDs" });
      return;
    }

    const validIds = notificationIds.filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => toObjectId(id));

    if (validIds.length === 0) {
      res.status(400).json({ message: "No valid notification IDs provided" });
      return;
    }

    const result = await Notification.deleteMany({ _id: { $in: validIds } });

    if (!result.deletedCount) {
      res.status(404).json({ message: "No notifications deleted. They might not exist." });
      return;
    }

    res.status(200).json({ message: "Notifications deleted successfully", deletedCount: result.deletedCount });
  } catch (error) {
    next(error);
  }
};
