import { Router } from "express";
import { createBadge, getBadges, updateBadge, deleteBadge } from "../controllers/badges.controller";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";
const router = Router();
router.post("/", verifyJWT, requireRole(["admin"]), createBadge);
router.get("/", verifyJWT, getBadges);
router.patch("/:id", verifyJWT, requireRole(["admin"]), updateBadge);
router.delete("/:id", verifyJWT, requireRole(["admin"]), deleteBadge);
export default router;
