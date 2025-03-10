import mongoose, { Schema } from "mongoose";
// ✅ Define Feedback Schema
const FeedbackSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    feedbackType: { type: String, enum: ["service", "employee", "app"], required: true },
    targetId: { type: Schema.Types.ObjectId, refPath: "feedbackType" }, // Dynamic reference
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
}, { timestamps: true });
// ✅ Export Feedback Model
export const Feedback = mongoose.model("Feedback", FeedbackSchema);
