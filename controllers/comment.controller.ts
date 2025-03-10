import { Request, Response } from "express";
import { Comment } from "../models/comment.model";

/** ✅ Create a Comment */
export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { relatedTo, message } = req.body;
    const userId = req.user?.userId; // ✅ FIXED: Use `userId` instead of `id`

    if (!relatedTo || !message) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }

    const comment = new Comment({
      user: userId,
      relatedTo,
      message,
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Error creating comment", error });
  }
};

/** ✅ Get Comments */
export const getComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const relatedTo = req.query.relatedTo || req.params.relatedTo;

    if (!relatedTo) {
      res.status(400).json({ message: "Missing 'relatedTo' parameter." });
      return;
    }

    const comments = await Comment.find({ relatedTo }).populate("user", "name email");

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error });
  }
};

/** ✅ Update a Comment */
export const updateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    const { id } = req.params;
    const userId = req.user?.userId; // ✅ FIXED: Use `userId`

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    if (comment.user.toString() !== userId) {
      res.status(403).json({ message: "Unauthorized to edit this comment" });
      return;
    }

    comment.message = message;
    await comment.save();

    res.json({ message: "Comment updated successfully", comment });
  } catch (error) {
    res.status(500).json({ message: "Error updating comment", error });
  }
};

/** ✅ Delete a Comment */
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId; // ✅ FIXED: Use `userId`

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    if (comment.user.toString() !== userId) {
      res.status(403).json({ message: "Unauthorized to delete this comment" });
      return;
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error });
  }
};
