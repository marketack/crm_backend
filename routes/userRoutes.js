const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  updateUserById,
  changeUserRole,
} = require("../controllers/userController");
const { protect, isAdmin } = require("../middleware/authMiddleware"); // Ensure correct import

const router = express.Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get logged-in user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", protect, getUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update logged-in user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile updated
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", protect, updateUserProfile);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Forbidden
 */
router.get("/", protect, isAdmin, getAllUsers);

/**
 * @swagger
 * /api/users/:id:
 *   get:
 *     summary: Get a user by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User found
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get("/:id", protect, isAdmin, getUserById);

/**
 * @swagger
 * /api/users/:id:
 *   put:
 *     summary: Update a user by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.put("/:id", protect, isAdmin, updateUserById);

/**
 * @swagger
 * /api/users/change-role:
 *   put:
 *     summary: Change a user's role (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User role updated
 *       403:
 *         description: Forbidden
 */
router.put("/change-role", protect, isAdmin, changeUserRole);

module.exports = router;
