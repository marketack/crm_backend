const express = require("express");
const { createLead, getLeads, updateLead, deleteLead } = require("../controllers/leadController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Leads
 *   description: Lead management API
 */

/**
 * @swagger
 * /api/leads:
 *   post:
 *     summary: Create a new lead
 *     description: Only logged-in users can create leads.
 *     tags: [Leads]
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
 *               - email
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 example: janedoe@example.com
 *               phone:
 *                 type: string
 *                 example: "+9876543210"
 *     responses:
 *       201:
 *         description: Lead created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lead created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized - User not logged in
 */
router.post("/", protect, createLead);

/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: Get all leads
 *     description: Only logged-in users can retrieve leads.
 *     tags: [Leads]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of leads retrieved successfully
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
 *                     example: Jane Doe
 *                   email:
 *                     type: string
 *                     example: janedoe@example.com
 *                   phone:
 *                     type: string
 *                     example: "+9876543210"
 *       401:
 *         description: Unauthorized - User not logged in
 */
router.get("/", protect, getLeads);

/**
 * @swagger
 * /api/leads/{id}:
 *   put:
 *     summary: Update a lead
 *     description: Only logged-in users can update a lead.
 *     tags: [Leads]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The lead ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Name
 *               email:
 *                 type: string
 *                 example: updatedemail@example.com
 *               phone:
 *                 type: string
 *                 example: "+1122334455"
 *     responses:
 *       200:
 *         description: Lead updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lead updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized - User not logged in
 *       404:
 *         description: Lead not found
 */
router.put("/:id", protect, updateLead);

/**
 * @swagger
 * /api/leads/{id}:
 *   delete:
 *     summary: Delete a lead
 *     description: Only admins can delete leads.
 *     tags: [Leads]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The lead ID
 *     responses:
 *       200:
 *         description: Lead deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lead deleted successfully
 *       401:
 *         description: Unauthorized - User not logged in
 *       403:
 *         description: Forbidden - Only admin users can delete leads
 *       404:
 *         description: Lead not found
 */
router.delete("/:id", protect, isAdmin, deleteLead);

module.exports = router;
