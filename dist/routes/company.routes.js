import express from "express";
import { createCompany, getAllCompanies, addTeamMember, updateCompany, deleteCompany, } from "../controllers/compnay.controller"; // ✅ Fixed Import Name
import { verifyJWT, requireRole } from "../middleware/authMiddleware";
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Company
 *   description: API endpoints for company management
 */
/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Create a new company
 *     description: Creates a new company. Requires authentication.
 *     tags: [Company]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Tech Solutions Ltd."
 *               industry:
 *                 type: string
 *                 example: "Software Development"
 *               location:
 *                 type: string
 *                 example: "New York, USA"
 *     responses:
 *       201:
 *         description: Company created successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post("/", verifyJWT, (req, res, next) => createCompany(req, res, next).catch(next));
/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Get all companies
 *     description: Retrieves a list of all registered companies. Requires authentication.
 *     tags: [Company]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of companies.
 *       401:
 *         description: Unauthorized.
 */
router.get("/", verifyJWT, (req, res, next) => getAllCompanies(req, res, next).catch(next));
/**
 * @swagger
 * /companies/add-staff:
 *   post:
 *     summary: Add a team member to a company
 *     description: Allows an owner or staff to add new team members.
 *     tags: [Company]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyId:
 *                 type: string
 *                 example: "60d21b4667d0d8992e610c85"
 *               memberId:
 *                 type: string
 *                 example: "60d21b8467d0d8992e610c90"
 *               role:
 *                 type: string
 *                 example: "staff"
 *     responses:
 *       200:
 *         description: Team member added successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (Only owners and staff can add members).
 */
router.post("/add-staff", verifyJWT, requireRole(["owner", "staff"]), (req, res, next) => addTeamMember(req, res, next).catch(next));
/**
 * @swagger
 * /companies/{companyId}:
 *   put:
 *     summary: Update company details
 *     description: Allows owners and staff to update a company’s details.
 *     tags: [Company]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: companyId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "60d21b4667d0d8992e610c85"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Tech Solutions Ltd."
 *               industry:
 *                 type: string
 *                 example: "AI & Automation"
 *     responses:
 *       200:
 *         description: Company updated successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.put("/:companyId", verifyJWT, requireRole(["owner", "staff"]), (req, res, next) => updateCompany(req, res, next).catch(next));
/**
 * @swagger
 * /companies/{companyId}:
 *   delete:
 *     summary: Delete a company
 *     description: Allows owners and staff to delete a company.
 *     tags: [Company]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: companyId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: Company deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Company not found.
 */
router.delete("/:companyId", verifyJWT, requireRole(["owner", "staff"]), (req, res, next) => deleteCompany(req, res, next).catch(next));
export default router;
