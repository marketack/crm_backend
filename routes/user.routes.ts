import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserProfile,
  getUserActivityLogs,
  generateApiKeyForUser,
  revokeApiKeyForUser,
  deactivateUser,
  deleteUser,
} from "../controllers/user.controller";
import { verifyJWT, requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and profile settings
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin Only)
 *     security:
 *       - BearerAuth: []
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *       403:
 *         description: Forbidden (Admin access required)
 */
router.get("/", verifyJWT, requireAdmin, async (req, res) => {
  await getAllUsers(req, res);
});

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get a user by ID
 *     security:
 *       - BearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       404:
 *         description: User not found
 */
router.get("/:userId", verifyJWT, async (req, res) => {
  await getUserById(req, res);
});

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     security:
 *       - BearerAuth: []
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               avatar:
 *                 type: string
 *               settings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put("/profile", verifyJWT, async (req, res) => {
  await updateUserProfile(req, res);
});

/**
 * @swagger
 * /users/logs:
 *   get:
 *     summary: Get user activity logs
 *     security:
 *       - BearerAuth: []
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Activity logs retrieved successfully
 */
router.get("/logs", verifyJWT, async (req, res) => {
  await getUserActivityLogs(req, res);
});

/**
 * @swagger
 * /users/api-key:
 *   post:
 *     summary: Generate API key for user
 *     security:
 *       - BearerAuth: []
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: API key generated successfully
 */
router.post("/api-key", verifyJWT, async (req, res) => {
  await generateApiKeyForUser(req, res);
});

/**
 * @swagger
 * /users/api-key:
 *   delete:
 *     summary: Revoke API key for user
 *     security:
 *       - BearerAuth: []
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: API key revoked successfully
 */
router.delete("/api-key", verifyJWT, async (req, res) => {
  await revokeApiKeyForUser(req, res);
});

/**
 * @swagger
 * /users/deactivate:
 *   put:
 *     summary: Deactivate user account
 *     security:
 *       - BearerAuth: []
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User account deactivated successfully
 */
router.put("/deactivate", verifyJWT, async (req, res) => {
  await deactivateUser(req, res);
});

/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete a user (Admin Only)
 *     security:
 *       - BearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Forbidden (Admin access required)
 */
router.delete("/:userId", verifyJWT, requireAdmin, async (req, res) => {
  await deleteUser(req, res);
});

export default router;
