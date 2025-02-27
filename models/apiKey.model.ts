import { Schema, model, Document } from "mongoose";

export interface IApiKey extends Document {
  userId: Schema.Types.ObjectId;
  key: string;
  createdAt: Date;
}

const apiKeySchema = new Schema<IApiKey>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  key: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default model<IApiKey>("ApiKey", apiKeySchema);
