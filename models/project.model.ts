import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ✅ Define Milestone Interface
interface IMilestone {
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  progress: number;
  assignedTo?: Types.ObjectId;
}

// ✅ Define Expense Interface
interface IExpense {
  amount: number;
  category: string;
  description?: string;
  incurredAt: Date;
}

// ✅ Define Team Member Interface (References Separate Role Model)
interface ITeamMember {
  user: Types.ObjectId;
  role: Types.ObjectId; // Reference to the Role model
}

// ✅ Define Project Interface
export interface IProject extends Document {
  name: string;
  description: string;
  budget: number;
  expenses: IExpense[];
  deadline: Date;
  priority: "low" | "medium" | "high" | "critical";
  status: "planned" | "in_progress" | "completed" | "on_hold" | "paused" | "archived" | "canceled";
  teamMembers: ITeamMember[]; // Uses separate Role model
  milestones: IMilestone[];
  attachments: string[];
  dependencies: Types.ObjectId[];
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
    
    expenses: [
      {
        amount: { type: Number, required: true },
        category: { type: String, required: true },
        description: { type: String },
        incurredAt: { type: Date, default: Date.now },
      },
    ],

    deadline: { type: Date, required: true },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["planned", "in_progress", "completed", "on_hold", "paused", "archived", "canceled"],
      default: "planned",
    },

    teamMembers: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: Schema.Types.ObjectId, ref: "Role", required: true }, // References Role model
      },
    ],

    milestones: [
      {
        title: { type: String, required: true },
        description: { type: String },
        dueDate: { type: Date, required: true },
        completed: { type: Boolean, default: false },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],

    attachments: [{ type: String }],

    dependencies: [{ type: Schema.Types.ObjectId, ref: "Project" }],

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// ✅ Export Project Model
export const Project: Model<IProject> = mongoose.model<IProject>("Project", ProjectSchema);
