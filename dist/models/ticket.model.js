import mongoose, { Schema } from "mongoose";
// ✅ Define Ticket Schema
const TicketSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["open", "in_progress", "closed"], default: "open" },
    category: { type: String, enum: ["billing", "technical", "general"], required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" }, // Support agent handling the ticket
    messages: [
        {
            sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });
// ✅ Export Ticket Model
export const Ticket = mongoose.model("Ticket", TicketSchema);
