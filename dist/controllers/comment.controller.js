var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Comment } from "../models/comment.model"; // ✅ Fix: Import IComment
/** ✅ Create a Comment */
export const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { relatedTo, type, message } = req.body;
        const comment = new Comment({
            user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, // Get user from JWT
            relatedTo,
            type, // "task" | "project" | "deal" | "file"
            message,
        });
        yield comment.save();
        res.status(201).json(comment);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating comment", error });
    }
});
/** ✅ Get Comments by Related Resource */
export const getComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { relatedTo } = req.params;
        const comments = yield Comment.find({ relatedTo }).populate("user", "name email");
        res.json(comments);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching comments", error });
    }
});
/** ✅ Update a Comment (Only Comment Owner) */
export const updateComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const comment = yield Comment.findById(req.params.id);
        if (!comment) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }
        // Ensure the user owns the comment
        if (comment.user.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            res.status(403).json({ message: "Unauthorized: You can only edit your own comments" });
            return;
        }
        // ✅ Fix: Use Type Assertion to IComment
        comment.message = req.body.message;
        yield comment.save();
        res.json(comment);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating comment", error });
    }
});
/** ✅ Delete a Comment (Admin or Comment Owner) */
export const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const comment = yield Comment.findById(req.params.id);
        if (!comment) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }
        // Only allow the comment owner or an admin to delete
        if (comment.user.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) && !((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes("admin"))) {
            res.status(403).json({ message: "Unauthorized: You can only delete your own comments" });
            return;
        }
        yield comment.deleteOne();
        res.json({ message: "Comment deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting comment", error });
    }
});
