import mongoose, { Schema } from "mongoose";
// ✅ Define Project Schema
const ProjectSchema = new Schema({
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
}, { timestamps: true });
// ✅ Export Project Model
export const Project = mongoose.model("Project", ProjectSchema);
