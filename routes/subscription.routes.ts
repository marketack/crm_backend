import express from "express";
import { verifyJWT } from "../middleware/authMiddleware";
import {
  getUserSubscriptions,
  subscribeToTool,
  unsubscribeFromTool,
} from "../controllers/subscriptionController";

const router = express.Router();

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Get all user subscriptions
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user subscriptions
 */
router.get("/", verifyJWT, async (req, res) => {
  await getUserSubscriptions(req, res);
});

/**
 * @swagger
 * /api/subscriptions/{toolId}:
 *   post:
 *     summary: Subscribe to a SaaS tool
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: toolId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Subscription created
 */
router.post("/:toolId", verifyJWT, async (req, res) => {
  await subscribeToTool(req, res);
});

/**
 * @swagger
 * /api/subscriptions/{subscriptionId}:
 *   delete:
 *     summary: Unsubscribe from a SaaS tool
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription canceled
 */
router.delete("/:subscriptionId", verifyJWT, async (req, res) => {
  await unsubscribeFromTool(req, res);
});

export default router;
