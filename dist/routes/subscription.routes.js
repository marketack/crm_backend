var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import { verifyJWT } from "../middleware/authMiddleware";
import { getUserSubscriptions, subscribeToTool, unsubscribeFromTool, } from "../controllers/subscriptionController";
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
router.get("/", verifyJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield getUserSubscriptions(req, res);
}));
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
router.post("/:toolId", verifyJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield subscribeToTool(req, res);
}));
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
router.delete("/:subscriptionId", verifyJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield unsubscribeFromTool(req, res);
}));
export default router;
