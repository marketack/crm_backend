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
import { getSaaSToolById, createSaaSTool, updateSaaSTool, deleteSaaSTool, } from "../controllers/saasController";
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
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
    }
    catch (error) {
        next(error);
    }
}));
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
router.get("/:toolId", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield getSaaSToolById(req, res);
    }
    catch (error) {
        next(error);
    }
}));
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
router.post("/", verifyJWT, requireAdmin, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield createSaaSTool(req, res);
    }
    catch (error) {
        next(error);
    }
}));
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
router.put("/:toolId", verifyJWT, requireAdmin, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield updateSaaSTool(req, res);
    }
    catch (error) {
        next(error);
    }
}));
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
router.delete("/:toolId", verifyJWT, requireAdmin, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield deleteSaaSTool(req, res);
    }
    catch (error) {
        next(error);
    }
}));
export default router;
