var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from "mongoose";
import Notification from "../models/notification.model";
// Convert String to ObjectId safely
const toObjectId = (id) => {
    return new mongoose.Types.ObjectId(id);
};
// Fix: Ensure `userId` is converted properly
export const createNotification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield newNotification.save();
        res.status(201).json({ success: true, message: "Notification created successfully", notification: newNotification });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Get All Notifications (Users get their own, Admins get all)
 * @route GET /notifications
 */
export const getUserNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }
        const notifications = yield Notification.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ message: "User notifications retrieved", notifications });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Get Notification by ID
 * @route GET /notifications/:id
 */
export const getNotificationById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: "Invalid notification ID" });
            return;
        }
        const notification = yield Notification.findById(toObjectId(id));
        if (!notification) {
            res.status(404).json({ message: "Notification not found" });
            return;
        }
        res.status(200).json({ message: "Notification retrieved successfully", notification });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Mark Single or Multiple Notifications as Read
 * @route PATCH /notifications/read
 */
export const markNotificationAsRead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield Notification.updateMany({ _id: { $in: validIds } }, { $set: { isRead: true } }, { new: true });
        if (!result.modifiedCount) {
            res.status(404).json({ message: "No notifications updated. They might already be read or do not exist." });
            return;
        }
        res.status(200).json({ message: "Notifications marked as read", updatedCount: result.modifiedCount });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Update a Notification (Title & Message)
 * @route PATCH /notifications/:id
 */
export const updateNotification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, message } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: "Invalid notification ID" });
            return;
        }
        const updatedNotification = yield Notification.findByIdAndUpdate(toObjectId(id), { $set: { title, message } }, { new: true });
        if (!updatedNotification) {
            res.status(404).json({ message: "Notification not found" });
            return;
        }
        res.status(200).json({ message: "Notification updated successfully", notification: updatedNotification });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Delete Single or Multiple Notifications
 * @route DELETE /notifications
 */
export const deleteNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield Notification.deleteMany({ _id: { $in: validIds } });
        if (!result.deletedCount) {
            res.status(404).json({ message: "No notifications deleted. They might not exist." });
            return;
        }
        res.status(200).json({ message: "Notifications deleted successfully", deletedCount: result.deletedCount });
    }
    catch (error) {
        next(error);
    }
});
