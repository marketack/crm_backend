import { Router } from "express";
import { submitFeedback, getFeedback } from "../controllers/feedback.controller";
import { verifyJWT } from "../middleware/authMiddleware";
const router = Router();
router.post("/", verifyJWT, submitFeedback);
router.get("/", verifyJWT, getFeedback);
export default router;
