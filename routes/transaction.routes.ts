import { Router } from "express";
import { createTransaction, getTransactions, updateTransaction, deleteTransaction } from "../controllers/transaction.controller";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";

const router = Router();

router.post("/", verifyJWT, createTransaction);
router.get("/", verifyJWT, requireRole(["admin", "finance"]), getTransactions);
router.patch("/:id", verifyJWT, requireRole(["admin"]), updateTransaction);
router.delete("/:id", verifyJWT, requireRole(["admin"]), deleteTransaction);

export default router;
