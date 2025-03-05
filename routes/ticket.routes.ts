import { Router } from "express";
import { createTicket, getTickets, updateTicket, deleteTicket, addTicketMessage } from "../controllers/ticket.controller";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";

const router = Router();

router.post("/", verifyJWT, createTicket);
router.get("/", verifyJWT, requireRole(["admin", "support"]), getTickets);
router.patch("/:id", verifyJWT, requireRole(["admin", "support", "user"]), updateTicket);
router.post("/:id/message", verifyJWT, addTicketMessage);
router.delete("/:id", verifyJWT, requireRole(["admin"]), deleteTicket);

export default router;
