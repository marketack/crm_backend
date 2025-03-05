import { Request, Response } from "express";
import { Comment, IComment } from "../models/comment.model"; // ✅ Fix: Import IComment

/** ✅ Create a Comment */
export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { relatedTo, type, message } = req.body;

    const comment = new Comment({
      user: req.user?.userId, // Get user from JWT
      relatedTo,
      type, // "task" | "project" | "deal" | "file"
      message,
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Error creating comment", error });
  }
};

/** ✅ Get Comments by Related Resource */
export const getComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { relatedTo } = req.params;

    const comments = await Comment.find({ relatedTo }).populate("user", "name email");
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error });
  }
};

/** ✅ Update a Comment (Only Comment Owner) */
export const updateComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        res.status(404).json({ message: "Comment not found" });
        return;
      }
  
      // Ensure the user owns the comment
      if (comment.user.toString() !== req.user?.userId) {
        res.status(403).json({ message: "Unauthorized: You can only edit your own comments" });
        return;
      }
  
      // ✅ Fix: Use Type Assertion to IComment
      (comment as IComment).message = req.body.message;
      await comment.save();
  
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: "Error updating comment", error });
    }
  };
  

/** ✅ Delete a Comment (Admin or Comment Owner) */
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    // Only allow the comment owner or an admin to delete
    if (comment.user.toString() !== req.user?.userId && !req.user?.roles.includes("admin")) {
      res.status(403).json({ message: "Unauthorized: You can only delete your own comments" });
      return;
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error });
  }
};
