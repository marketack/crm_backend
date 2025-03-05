import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ✅ Define Comment Interface
export interface IComment extends Document {
  user: Types.ObjectId;
  relatedTo: Types.ObjectId;
  type: "task" | "project" | "deal" | "file";
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Define Comment Schema
const CommentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    relatedTo: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, enum: ["task", "project", "deal", "file"], required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

// ✅ Export the Model
export const Comment: Model<IComment> = mongoose.model<IComment>("Comment", CommentSchema);
