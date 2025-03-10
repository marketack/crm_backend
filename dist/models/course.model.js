// models/course.model.ts
import mongoose, { Schema } from "mongoose";
const LessonSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    videoUrl: { type: String },
    duration: { type: Number },
});
const CourseSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", required: true }, // ✅ Fix: Always include status
    lessons: [LessonSchema],
    enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
export default mongoose.model("Course", CourseSchema);
