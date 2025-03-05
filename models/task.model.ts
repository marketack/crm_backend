import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ✅ Define Task Interface
export interface ITask extends Document {
  project: Types.ObjectId;
  title: string;
  description?: string;
  assignedTo?: Types.ObjectId;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  dueDate?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Define Task Schema
const TaskSchema = new Schema<ITask>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["pending", "in_progress", "completed"], default: "pending" },
    dueDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// ✅ Export Task Model
export const Task: Model<ITask> = mongoose.model<ITask>("Task", TaskSchema);
