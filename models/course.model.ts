// models/course.model.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILesson {
  title: string;
  content: string;
  videoUrl?: string;
  duration?: number;
}

export interface ICourse extends Document {
  title: string;
  description: string;
  price: number;
  createdBy: Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  lessons: ILesson[];
  enrolledUsers: Types.ObjectId[];
  reviewedBy?: Types.ObjectId;
}

const LessonSchema = new Schema<ILesson>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  videoUrl: { type: String },
  duration: { type: Number },
});

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", required: true }, // ✅ Fix: Always include status
    lessons: [LessonSchema],
    enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model<ICourse>("Course", CourseSchema);
