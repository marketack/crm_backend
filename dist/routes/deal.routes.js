import { Router } from "express";
import { createDeal, getDeals, updateDeal, deleteDeal } from "../controllers/deal.controller";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";
const router = Router();
router.post("/", verifyJWT, requireRole(["admin", "sales"]), createDeal);
router.get("/", verifyJWT, requireRole(["admin", "sales"]), getDeals);
router.patch("/:id", verifyJWT, requireRole(["admin", "sales"]), updateDeal);
router.delete("/:id", verifyJWT, requireRole(["admin"]), deleteDeal);
export default router;
