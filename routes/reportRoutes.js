const express = require("express");
const {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
} = require("../controllers/reportController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Report management API
 */

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Create a new report
 *     description: Adds a new report to the system.
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: Monthly Sales Report
 *               description:
 *                 type: string
 *                 example: This report contains the sales analysis for the month.
 *     responses:
 *       201:
 *         description: Report created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Report created successfully
 *       400:
 *         description: Bad request
 */
router.post("/", createReport);

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all reports
 *     description: Retrieves a list of all reports.
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: List of reports retrieved successfully
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
 *                   title:
 *                     type: string
 *                     example: Monthly Sales Report
 *                   description:
 *                     type: string
 *                     example: This report contains the sales analysis for the month.
 */
router.get("/", getReports);

/**
 * @swagger
 * /api/reports/{id}:
 *   get:
 *     summary: Get a single report by ID
 *     description: Retrieves a specific report based on its ID.
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The report ID
 *     responses:
 *       200:
 *         description: Report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 61c4c5f4a3b2f8a37e543dcb
 *                 title:
 *                   type: string
 *                   example: Monthly Sales Report
 *                 description:
 *                   type: string
 *                   example: This report contains the sales analysis for the month.
 *       404:
 *         description: Report not found
 */
router.get("/:id", getReportById);

/**
 * @swagger
 * /api/reports/{id}:
 *   put:
 *     summary: Update a report
 *     description: Modifies an existing report.
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Sales Report
 *               description:
 *                 type: string
 *                 example: This report contains the updated sales analysis.
 *     responses:
 *       200:
 *         description: Report updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Report updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Report not found
 */
router.put("/:id", updateReport);

/**
 * @swagger
 * /api/reports/{id}:
 *   delete:
 *     summary: Delete a report
 *     description: Removes a report from the system.
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The report ID
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Report deleted successfully
 *       404:
 *         description: Report not found
 */
router.delete("/:id", deleteReport);

module.exports = router;
