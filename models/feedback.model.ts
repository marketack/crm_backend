import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ✅ Define Feedback Interface
export interface IFeedback extends Document {
  user: Types.ObjectId;
  feedbackType: "service" | "employee" | "app";
  targetId?: Types.ObjectId;
  message: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Define Feedback Schema
const FeedbackSchema = new Schema<IFeedback>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    feedbackType: { type: String, enum: ["service", "employee", "app"], required: true },
    targetId: { type: Schema.Types.ObjectId, refPath: "feedbackType" }, // Dynamic reference
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

// ✅ Export Feedback Model
export const Feedback: Model<IFeedback> = mongoose.model<IFeedback>("Feedback", FeedbackSchema);
