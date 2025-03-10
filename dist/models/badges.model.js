import mongoose, { Schema } from "mongoose";
// ✅ Define Badge Schema
const BadgeSchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    iconUrl: { type: String },
    criteria: { type: String, required: true }, // e.g. "Completed 10 courses"
}, { timestamps: true });
// ✅ Export Named Model
export const Badge = mongoose.model("Badge", BadgeSchema);
