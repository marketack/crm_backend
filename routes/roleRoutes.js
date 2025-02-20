const express = require("express");
const { createRole, getRoles, updateRole } = require("../controllers/roleController");
const { protect, superAdminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role Management API
 */

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new role (Super Admin only)
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 */
router.post("/", protect, superAdminOnly, createRole);

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 */
router.get("/", protect, getRoles);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Update a role (Super Admin only)
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 */
router.put("/:id", protect, superAdminOnly, updateRole);

module.exports = router;
