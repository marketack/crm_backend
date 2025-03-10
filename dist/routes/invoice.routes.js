import { Router } from "express";
import { createInvoice, getInvoices, updateInvoice, deleteInvoice, recordPayment } from "../controllers/invoice.controller";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";
const router = Router();
router.post("/", verifyJWT, requireRole(["admin", "accounting"]), createInvoice);
router.get("/", verifyJWT, getInvoices);
router.patch("/:id", verifyJWT, requireRole(["admin", "accounting"]), updateInvoice);
router.post("/:id/pay", verifyJWT, requireRole(["admin", "accounting"]), recordPayment); // ✅ Payment API
router.delete("/:id", verifyJWT, requireRole(["admin", "accounting"]), deleteInvoice);
export default router;
