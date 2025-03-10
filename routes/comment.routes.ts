import { Router } from "express";
import { createComment, getComments, updateComment, deleteComment } from "../controllers/comment.controller";
import { verifyJWT } from "../middleware/authMiddleware";

const router = Router();

router.post("/", verifyJWT, createComment); // ✅ Users can add comments
router.get("/", verifyJWT, getComments); // ✅ Fetch comments via query param
router.get("/:relatedTo", verifyJWT, getComments); // ✅ Fetch comments via URL param
router.patch("/:id", verifyJWT, updateComment); // ✅ Edit a comment
router.delete("/:id", verifyJWT, deleteComment); // ✅ Delete a comment

export default router;
