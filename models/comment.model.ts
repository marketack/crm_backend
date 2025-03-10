import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  user: mongoose.Types.ObjectId;
  relatedTo: string;
  message: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ User who created the comment
    relatedTo: { type: String, required: true }, // ✅ The related page or section
    message: { type: String, required: true }, // ✅ The comment text
  },
  { timestamps: true } // ✅ Automatically add createdAt and updatedAt fields
);

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);
