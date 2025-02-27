import { Schema, model, Document } from "mongoose";

export interface IActivityLog extends Document {
  userId: Schema.Types.ObjectId;
  action: string;
  timestamp: Date;
  ipAddress?: string;
}

const activityLogSchema = new Schema<IActivityLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String },
});

export default model<IActivityLog>("ActivityLog", activityLogSchema);
