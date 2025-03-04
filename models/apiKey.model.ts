import mongoose, { Document, Schema, Model } from "mongoose";

export interface IApiKey extends Document {
  userId: mongoose.Types.ObjectId;
  key: string;
  createdAt: Date;
  expiresAt: Date;
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    key: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const ApiKey: Model<IApiKey> = mongoose.model<IApiKey>("ApiKey", ApiKeySchema);
export default ApiKey;
