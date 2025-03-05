import { Router } from "express";
import { getLogs, clearLogs } from "../controllers/logs.controller";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";

const router = Router();

router.get("/", verifyJWT, requireRole(["admin"]), getLogs);
router.delete("/", verifyJWT, requireRole(["admin"]), clearLogs);

export default router;
