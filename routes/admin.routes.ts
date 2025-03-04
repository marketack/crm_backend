import express, { Request, Response, NextFunction } from "express";
import { requireAdmin, verifyJWT } from "../middleware/authMiddleware";
import {
  createRole,
  getAllUsers,
  getUserById,
  getAllRoles,
  updateRolePermissions,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
  assignPermissionToRole,
  removePermissionFromRole,
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
 * /admin/roles:
 *   post:
 *     summary: Create a new role
 *     security:
 *       - BearerAuth: []
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Manager"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["edit_users", "view_reports"]
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Role already exists
 *       500:
 *         description: Server error
 */
router.post("/roles", requireAdmin, asyncWrapper(createRole));

/**
 * @swagger
 * /admin/roles:
 *   get:
 *     summary: Get all roles
 *     security:
 *       - BearerAuth: []
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of roles
 *       500:
 *         description: Server error
 */
router.get("/roles", requireAdmin, asyncWrapper(getAllRoles));

/**
 * @swagger
 * /admin/roles/{roleId}:
 *   put:
 *     summary: Update role permissions
 *     security:
 *       - BearerAuth: []
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["edit_users", "delete_posts"]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.put("/roles/:roleId", requireAdmin, asyncWrapper(updateRolePermissions));

/**
 * @swagger
 * /admin/roles/{roleId}:
 *   delete:
 *     summary: Delete a role
 *     security:
 *       - BearerAuth: []
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.delete("/roles/:roleId", requireAdmin, asyncWrapper(deleteRole));

/**
 * @swagger
 * /admin/users/assign-role:
 *   post:
 *     summary: Assign role to user
 *     security:
 *       - BearerAuth: []
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               roleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role assigned successfully
 *       404:
 *         description: User or Role not found
 *       500:
 *         description: Server error
 */
router.post("/users/assign-role", requireAdmin, asyncWrapper(assignRoleToUser));

/**
 * @swagger
 * /admin/users/remove-role:
 *   post:
 *     summary: Remove role from user
 *     security:
 *       - BearerAuth: []
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               roleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role removed successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/users/remove-role", requireAdmin, asyncWrapper(removeRoleFromUser));

/**
 * @swagger
 * /admin/roles/assign-permission:
 *   post:
 *     summary: Assign permission to role
 *     security:
 *       - BearerAuth: []
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: string
 *               permission:
 *                 type: string
 *     responses:
 *       200:
 *         description: Permission assigned successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.post("/roles/assign-permission", requireAdmin, asyncWrapper(assignPermissionToRole));

/**
 * @swagger
 * /admin/roles/remove-permission:
 *   post:
 *     summary: Remove permission from role
 *     security:
 *       - BearerAuth: []
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: string
 *               permission:
 *                 type: string
 *     responses:
 *       200:
 *         description: Permission removed successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.post("/roles/remove-permission", requireAdmin, asyncWrapper(removePermissionFromRole));

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
router.get("/users", verifyJWT, requireAdmin, asyncWrapper(getAllUsers));

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
router.get("/users/:userId", verifyJWT, requireAdmin, asyncWrapper(getUserById));

export default router;
