import express from "express";
import { createNotification, getUserNotifications, getNotificationById, markNotificationAsRead, updateNotification, deleteNotifications, } from "../controllers/notification.controller";
import { verifyJWT } from "../middleware/authMiddleware";
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API endpoints for managing user notifications
 */
/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a new notification
 *     description: Adds a new notification for a user.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *               message:
 *                 type: string
 *                 example: "Your order has been shipped!"
 *               type:
 *                 type: string
 *                 example: "order_update"
 *               isRead:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Notification created successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post("/", verifyJWT, createNotification);
/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get user notifications
 *     description: Retrieves all notifications for the authenticated user.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user notifications.
 *       401:
 *         description: Unauthorized.
 */
router.get("/", verifyJWT, getUserNotifications);
/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Get a single notification by ID
 *     description: Retrieves a specific notification using its ID.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "60d21b8467d0d8992e610c90"
 *     responses:
 *       200:
 *         description: Notification details.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Notification not found.
 */
router.get("/:id", verifyJWT, getNotificationById);
/**
 * @swagger
 * /notifications/read:
 *   patch:
 *     summary: Mark notifications as read
 *     description: Marks all unread notifications as read for the authenticated user.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications marked as read.
 *       401:
 *         description: Unauthorized.
 */
router.patch("/read", verifyJWT, markNotificationAsRead);
/**
 * @swagger
 * /notifications/{id}:
 *   patch:
 *     summary: Update a notification
 *     description: Allows updating specific fields of a notification.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "60d21b8467d0d8992e610c90"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Your order has been delivered."
 *               isRead:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Notification updated successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Notification not found.
 */
router.patch("/:id", verifyJWT, updateNotification);
/**
 * @swagger
 * /notifications:
 *   delete:
 *     summary: Delete notifications
 *     description: Deletes all notifications for the authenticated user.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications deleted successfully.
 *       401:
 *         description: Unauthorized.
 */
router.delete("/", verifyJWT, deleteNotifications);
export default router;
