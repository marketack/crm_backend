const express = require("express");
const {
  createPermission,
  getPermissions,
  updatePermission,
  deletePermission,
} = require("../controllers/permissionController");
const { protect, superAdminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Permissions
 *   description: Permissions Management API
 */

/**
 * @swagger
 * /api/permissions:
 *   post:
 *     summary: Create a new permission (Super Admin only)
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 */
router.post("/", protect, superAdminOnly, createPermission);

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 */
router.get("/", protect, getPermissions);

/**
 * @swagger
 * /api/permissions/{id}:
 *   put:
 *     summary: Update a permission (Super Admin only)
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 */
router.put("/:id", protect, superAdminOnly, updatePermission);

/**
 * @swagger
 * /api/permissions/{id}:
 *   delete:
 *     summary: Delete a permission (Super Admin only)
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 */
router.delete("/:id", protect, superAdminOnly, deletePermission);

module.exports = router;
