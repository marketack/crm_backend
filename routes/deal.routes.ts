import { Router } from "express";
import { createDeal, getDeals, updateDeal, deleteDeal } from "../controllers/deal.controller";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";

const router = Router();

router.post("/", verifyJWT, requireRole(["admin", "sales","owner"]), createDeal);
router.get("/", verifyJWT, requireRole(["admin", "sales","owner"]), getDeals);
router.patch("/:id", verifyJWT, requireRole(["admin", "sales","owner"]), updateDeal);
router.delete("/:id", verifyJWT, requireRole(["admin","owner"]), deleteDeal);

export default router;
