const express = require("express");
const {
  createLead,
  getLeads,
  updateLead,
  deleteLead,
} = require("../controllers/leadController");

const { protect, hasPermission } = require("../middleware/authMiddleware");

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
 *     description: Only users with "create_lead" permission can create leads.
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
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       400:
 *         description: Bad request
 */
router.post("/", protect, hasPermission("create_lead"), createLead);

/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: Get all leads
 *     description: Users need the "view_leads" permission to retrieve leads.
 *     tags: [Leads]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of leads retrieved successfully
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       401:
 *         description: Unauthorized - User not logged in
 */
router.get("/", protect, hasPermission("view_leads"), getLeads);

/**
 * @swagger
 * /api/leads/{id}:
 *   put:
 *     summary: Update a lead
 *     description: Users need the "edit_lead" permission to update leads.
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
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       400:
 *         description: Bad request
 *       404:
 *         description: Lead not found
 */
router.put("/:id", protect, hasPermission("edit_lead"), updateLead);

/**
 * @swagger
 * /api/leads/{id}:
 *   delete:
 *     summary: Delete a lead
 *     description: Users need the "delete_lead" permission to remove leads.
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
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Lead not found
 */
router.delete("/:id", protect, hasPermission("delete_lead"), deleteLead);

module.exports = router;
