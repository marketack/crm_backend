const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getDashboardData } = require("../controllers/dashboardController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics API
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Fetches counts of leads, customers, and tasks. Only logged-in users can access this data.
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 leads:
 *                   type: integer
 *                   example: 120
 *                 customers:
 *                   type: integer
 *                   example: 85
 *                 tasks:
 *                   type: integer
 *                   example: 40
 *       401:
 *         description: Unauthorized - User not logged in
 */
router.get("/", protect, getDashboardData);

module.exports = router;
