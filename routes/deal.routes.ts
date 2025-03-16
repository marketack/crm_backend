import { Router } from "express";
import { createDeal, getDeals, updateDeal, deleteDeal } from "../controllers/deal.controller";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler"; // ✅ Import the async handler

const router = Router();

router.post("/", verifyJWT, requireRole(["admin", "sales", "owner"]), asyncHandler(createDeal));
router.get("/", verifyJWT, requireRole(["admin", "sales", "owner"]), asyncHandler(getDeals));
router.patch("/:id", verifyJWT, requireRole(["admin", "sales", "owner"]), asyncHandler(updateDeal));
router.delete("/:id", verifyJWT, requireRole(["admin", "owner"]), asyncHandler(deleteDeal));

export default router;
