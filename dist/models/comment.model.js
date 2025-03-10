import mongoose, { Schema } from "mongoose";
// ✅ Define Comment Schema
const CommentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    relatedTo: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, enum: ["task", "project", "deal", "file"], required: true },
    message: { type: String, required: true },
}, { timestamps: true });
// ✅ Export the Model
export const Comment = mongoose.model("Comment", CommentSchema);
