const express = require("express");
const { createStaff, getAllStaff, deleteStaff } = require("../controllers/staffController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Staff management API
 */

/**
 * @swagger
 * /api/staff:
 *   get:
 *     summary: Get all staff members
 *     description: Only authenticated users can fetch the list of staff members.
 *     tags: [Staff]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Staff members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 61c4c5f4a3b2f8a37e543dcb
 *                   name:
 *                     type: string
 *                     example: John Doe
 *                   role:
 *                     type: string
 *                     example: Manager
 *       401:
 *         description: Unauthorized - User not logged in
 */
router.get("/", protect, getAllStaff);

/**
 * @swagger
 * /api/staff:
 *   post:
 *     summary: Create a new staff member
 *     description: Only admin users can add new staff members.
 *     tags: [Staff]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               role:
 *                 type: string
 *                 example: Supervisor
 *     responses:
 *       201:
 *         description: Staff member created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff member created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized - User not logged in
 *       403:
 *         description: Forbidden - Only admin users can create staff members
 */
router.post("/", protect, isAdmin, createStaff);

/**
 * @swagger
 * /api/staff/{id}:
 *   delete:
 *     summary: Delete a staff member
 *     description: Only admin users can delete staff members.
 *     tags: [Staff]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The staff member ID
 *     responses:
 *       200:
 *         description: Staff member deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff member deleted successfully
 *       401:
 *         description: Unauthorized - User not logged in
 *       403:
 *         description: Forbidden - Only admin users can delete staff members
 *       404:
 *         description: Staff member not found
 */
router.delete("/:id", protect, isAdmin, deleteStaff);

module.exports = router;
