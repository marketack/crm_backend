import mongoose, { Schema } from "mongoose";
const ApiKeySchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    key: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });
const ApiKey = mongoose.model("ApiKey", ApiKeySchema);
export default ApiKey;
