import express, { Request, Response, NextFunction } from "express";
import { requireAdmin } from "../middleware/authMiddleware";
import {
  createRole,
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
 * 🆕 Middleware Wrapper to Handle Async Errors Correctly
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
 *   name: Admin
 *   description: Role & Permission Management (Admin Only)
 */

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
router.post("/roles", requireAdmin, asyncWrapper(async (req, res) => {
  await createRole(req, res);
}));

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
 */router.get("/roles", requireAdmin, asyncWrapper(async (req, res) => {
  await getAllRoles(req, res);
}));

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
router.put("/roles/:roleId", requireAdmin, asyncWrapper(async (req, res) => {
  await updateRolePermissions(req, res);
}));

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
router.delete("/roles/:roleId", requireAdmin, asyncWrapper(async (req, res) => {
  await deleteRole(req, res);
}));

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
router.post("/users/assign-role", requireAdmin, asyncWrapper(async (req, res) => {
  await assignRoleToUser(req, res);
}));

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
router.post("/users/remove-role", requireAdmin, asyncWrapper(async (req, res) => {
  await removeRoleFromUser(req, res);
}));

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
router.post("/roles/assign-permission", requireAdmin, asyncWrapper(async (req, res) => {
  await assignPermissionToRole(req, res);
}));

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
router.post("/roles/remove-permission", requireAdmin, asyncWrapper(async (req, res) => {
  await removePermissionFromRole(req, res);
}));

export default router;
