import { Router } from "express";
import { createContact, getContacts, updateContact, deleteContact } from "../controllers/contacts.controller";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";
const router = Router();
router.post("/", verifyJWT, requireRole(["admin", "manager"]), createContact);
router.get("/", verifyJWT, getContacts);
router.patch("/:id", verifyJWT, requireRole(["admin", "manager"]), updateContact);
router.delete("/:id", verifyJWT, requireRole(["admin"]), deleteContact);
export default router;
