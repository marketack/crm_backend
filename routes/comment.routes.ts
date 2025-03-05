import { Router } from "express";
import { createComment, getComments, updateComment, deleteComment } from "../controllers/comment.controller";
import { verifyJWT } from "../middleware/authMiddleware";

const router = Router();

router.post("/", verifyJWT, createComment); // Users can add comments
router.get("/:relatedTo", verifyJWT, getComments); // Fetch comments for a related resource (Task, Deal, etc.)
router.patch("/:id", verifyJWT, updateComment); // Edit a comment
router.delete("/:id", verifyJWT, deleteComment); // Delete comment (Admins or comment owners)

export default router;
