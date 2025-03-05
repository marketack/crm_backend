import express from "express";
import {
  getSaaSTools,
  getSaaSToolById,
  createSaaSTool,
  updateSaaSTool,
  deleteSaaSTool,
} from "../controllers/saasController";
import { verifyJWT, requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * /api/saas:
 *   get:
 *     summary: Retrieve all SaaS tools (public)
 *     tags: [SaaS Tools]
 *     responses:
 *       200:
 *         description: List of SaaS tools
 */
router.get("/", async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/saas/{toolId}:
 *   get:
 *     summary: Retrieve a specific SaaS tool (public)
 *     tags: [SaaS Tools]
 *     parameters:
 *       - in: path
 *         name: toolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SaaS tool found
 */
router.get("/:toolId", async (req, res, next) => {
  try {
    await getSaaSToolById(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/saas:
 *   post:
 *     summary: Create a new SaaS tool (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: SaaS tool created
 */
router.post("/", verifyJWT, requireAdmin, async (req, res, next) => {
  try {
    await createSaaSTool(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/saas/{toolId}:
 *   put:
 *     summary: Update a SaaS tool (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: toolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SaaS tool updated
 */
router.put("/:toolId", verifyJWT, requireAdmin, async (req, res, next) => {
  try {
    await updateSaaSTool(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/saas/{toolId}:
 *   delete:
 *     summary: Delete a SaaS tool (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: toolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SaaS tool deleted
 */
router.delete("/:toolId", verifyJWT, requireAdmin, async (req, res, next) => {
  try {
    await deleteSaaSTool(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
