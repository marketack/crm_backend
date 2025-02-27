import express from "express";
import asyncHandler from "express-async-handler";
import { getAllCMS, getCMSById, createCMS, updateCMS, deleteCMS } from "../controllers/cms.controller";
import { verifyJWT } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: CMS
 *   description: Content Management System API
 */

/**
 * @swagger
 * /api/cms:
 *   get:
 *     summary: Get all CMS entries (with optional status filter)
 *     description: Fetches all CMS content from the database.
 *     tags: [CMS]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["published", "draft", "archived"]
 *         description: Filter by CMS status
 *     responses:
 *       200:
 *         description: Successfully retrieved all CMS entries.
 */
router.get("/", asyncHandler(getAllCMS));

/**
 * @swagger
 * /api/cms/{id}:
 *   get:
 *     summary: Get a single CMS entry
 *     description: Fetches a specific CMS entry by ID.
 *     tags: [CMS]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The CMS entry ID
 *     responses:
 *       200:
 *         description: Successfully retrieved CMS entry.
 *       404:
 *         description: CMS entry not found.
 */
router.get("/:id", asyncHandler(getCMSById));

/**
 * @swagger
 * /api/cms:
 *   post:
 *     summary: Create a new CMS entry
 *     description: Adds a new CMS content entry.
 *     tags: [CMS]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "New Blog Post"
 *               slug:
 *                 type: string
 *                 example: "new-blog-post"
 *               content:
 *                 type: string
 *                 example: "This is the content of the blog post."
 *               status:
 *                 type: string
 *                 enum: ["published", "draft"]
 *     responses:
 *       201:
 *         description: Successfully created CMS entry.
 *       400:
 *         description: Missing required fields.
 */
router.post("/", verifyJWT, asyncHandler(createCMS));

/**
 * @swagger
 * /api/cms/{id}:
 *   put:
 *     summary: Update a CMS entry
 *     description: Updates a CMS content entry.
 *     tags: [CMS]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The CMS entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: ["published", "draft"]
 *     responses:
 *       200:
 *         description: Successfully updated CMS entry.
 *       404:
 *         description: CMS entry not found.
 */
router.put("/:id", verifyJWT, asyncHandler(updateCMS));

/**
 * @swagger
 * /api/cms/{id}:
 *   delete:
 *     summary: Soft delete a CMS entry
 *     description: Deletes a CMS entry by ID.
 *     tags: [CMS]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The CMS entry ID
 *     responses:
 *       200:
 *         description: Successfully deleted CMS entry.
 *       404:
 *         description: CMS entry not found.
 */
router.delete("/:id", verifyJWT, asyncHandler(deleteCMS));

export default router;
