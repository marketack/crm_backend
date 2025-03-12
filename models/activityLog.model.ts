import { Schema, model, Document, Types } from "mongoose";

export interface IActivityLog extends Document {
  userId: Types.ObjectId;
  userRole?: string;
  action: string;
  targetType: "lead" | "customer" | "deal" | "invoice" | "task" | "contact" | "note" | "email" | "call";
  targetId: Types.ObjectId;
  details?: string; // Description of what happened
  timestamp: Date;
  ipAddress?: string;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userRole: { type: String, default: "user" },
    action: { type: String, required: true },
    targetType: {
      type: String,
      enum: ["lead", "customer", "deal", "invoice", "task", "contact", "note", "email", "call"],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
    details: { type: String },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

export const ActivityLog = model<IActivityLog>("ActivityLog", activityLogSchema);
