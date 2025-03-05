import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ✅ Define Ticket Message Interface
interface ITicketMessage {
  sender: Types.ObjectId;
  content: string;
  timestamp: Date;
}

// ✅ Define Ticket Interface
export interface ITicket extends Document {
  user: Types.ObjectId;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "closed";
  category: "billing" | "technical" | "general";
  assignedTo?: Types.ObjectId;
  messages: ITicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Define Ticket Schema
const TicketSchema = new Schema<ITicket>(
  {
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
  },
  { timestamps: true }
);

// ✅ Export Ticket Model
export const Ticket: Model<ITicket> = mongoose.model<ITicket>("Ticket", TicketSchema);
