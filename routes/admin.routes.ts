import express, { Request, Response, NextFunction } from "express";
import {requireRole,  verifyJWT } from "../middleware/authMiddleware";
import {
  createRole,
  getAllUsers,
  getUserById,
} from "../controllers/admin.controller";

const router = express.Router();

/**
 * ✅ Middleware Wrapper to Handle Async Errors Correctly
 */
const asyncWrapper =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };


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
router.get("/users", verifyJWT,  requireRole(["admin"]), asyncWrapper(getAllUsers));

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
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       404:
 *         description: User not found
 */
router.get("/users/:userId", verifyJWT, requireRole(["admin"]), asyncWrapper(getUserById));

export default router;
