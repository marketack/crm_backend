import express from "express";
import asyncHandler from "express-async-handler"; // ✅ Handles async errors properly
import { getNotifications, markAsRead } from "../controllers/notification.controller";
import { verifyJWT } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management API
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications for the authenticated user
 *     description: Retrieves the list of notifications for the logged-in user.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved notifications.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "60e8c1f9b60f5b2a10c6a29a"
 *                   message:
 *                     type: string
 *                     example: "You have a new message."
 *                   isRead:
 *                     type: boolean
 *                     example: false
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized (JWT token required).
 */
router.get("/", verifyJWT, asyncHandler(async (req, res) => {
  await getNotifications(req, res);
}));

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     description: Marks a notification as read by its ID.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read.
 *       404:
 *         description: Notification not found.
 *       401:
 *         description: Unauthorized (JWT token required).
 */
router.put("/:id/read", verifyJWT, asyncHandler(async (req, res) => {
  await markAsRead(req, res);
}));

export default router;
