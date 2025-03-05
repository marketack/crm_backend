import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ✅ Define Project Milestone Interface
interface IMilestone {
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
}

// ✅ Define Project Interface
export interface IProject extends Document {
  name: string;
  description: string;
  budget: number;
  expenses: number;
  deadline: Date;
  status: "planned" | "in_progress" | "completed" | "on_hold" | "canceled";
  teamMembers: Types.ObjectId[];
  milestones: IMilestone[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Define Project Schema
const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    expenses: { type: Number, default: 0 },
    deadline: { type: Date, required: true },
    
    status: {
      type: String,
      enum: ["planned", "in_progress", "completed", "on_hold", "canceled"],
      default: "planned",
    },

    teamMembers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],

    milestones: [
      {
        title: { type: String, required: true },
        description: { type: String },
        dueDate: { type: Date, required: true },
        completed: { type: Boolean, default: false },
      },
    ],

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// ✅ Export Project Model
export const Project: Model<IProject> = mongoose.model<IProject>("Project", ProjectSchema);
