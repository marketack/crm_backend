import { Router } from "express";
import { createLead, getLeads, updateLead, deleteLead, convertLeadToCustomer } from "../controllers/lead.controller";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";

const router = Router();

router.post("/", verifyJWT, requireRole(["admin", "sales","owner"]), createLead);
router.get("/", verifyJWT, getLeads);
router.patch("/:id", verifyJWT, requireRole(["admin", "sales","owner"]), updateLead);
router.delete("/:id", verifyJWT, requireRole(["admin","owner"]), deleteLead);
router.post("/leads/:id/convert",verifyJWT,requireRole(["admin","owner"]), convertLeadToCustomer);

export default router;
