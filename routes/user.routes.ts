import express from "express";
import {
  updateUserProfile,
  getUserProfile,
  getUserActivityLogs,
  generateApiKeyForUser,
  revokeApiKeyForUser,
  deactivateUser,
  deleteUser,
  getUserSubscriptionStatus,
} from "../controllers/user.controller";

import {
  verifyJWT,
  requireAdmin,
  requireRole,
  restrictSelfModification,
} from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /users/profile/{userId}:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the profile of a specific user.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "60d21b8467d0d8992e610c90"
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 */
router.get("/profile/:userId", verifyJWT, getUserProfile);

/**
 * @swagger
 * /users/profile/{userId}:
 *   put:
 *     summary: Update user profile
 *     description: Allows a user to update their profile information.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userId
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
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.put("/profile/:userId", verifyJWT, updateUserProfile);

/**
 * @swagger
 * /users/activity-logs:
 *   get:
 *     summary: Get user activity logs
 *     description: Retrieves logs of user activity.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Activity logs retrieved successfully.
 *       401:
 *         description: Unauthorized.
 */
router.get("/activity-logs", verifyJWT, getUserActivityLogs);

/**
 * @swagger
 * /users/api-key:
 *   post:
 *     summary: Generate API key for user
 *     description: Allows a user to generate an API key for authentication.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: API key generated successfully.
 *       401:
 *         description: Unauthorized.
 */
router.post("/api-key", verifyJWT, generateApiKeyForUser);

/**
 * @swagger
 * /users/api-key:
 *   delete:
 *     summary: Revoke API key for user
 *     description: Revokes a user's API key.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: API key revoked successfully.
 *       401:
 *         description: Unauthorized.
 */
router.delete("/api-key", verifyJWT, revokeApiKeyForUser);

/**
 * @swagger
 * /users/deactivate:
 *   put:
 *     summary: Deactivate user account
 *     description: Allows a user to deactivate their account.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Account deactivated successfully.
 *       401:
 *         description: Unauthorized.
 */
router.put("/deactivate", verifyJWT, deactivateUser);

/**
 * @swagger
 * /users:
 *   delete:
 *     summary: Delete a user account
 *     description: Permanently deletes a user account (Admin only).
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Admin privileges required.
 */
router.delete("/", verifyJWT, requireAdmin, deleteUser);

/**
 * @swagger
 * /users/{userId}/subscriptions:
 *   get:
 *     summary: Get user subscription status
 *     description: Retrieves the subscription status of a user.
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "60d21b8467d0d8992e610c90"
 *     responses:
 *       200:
 *         description: Subscription status retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 */
router.get("/:userId/subscriptions", verifyJWT, getUserSubscriptionStatus);

export default router;
