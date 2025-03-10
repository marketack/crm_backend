import mongoose, { Schema } from "mongoose";
// ✅ Define Task Schema
const TaskSchema = new Schema({
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["pending", "in_progress", "completed"], default: "pending" },
    dueDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
// ✅ Export Task Model
export const Task = mongoose.model("Task", TaskSchema);
