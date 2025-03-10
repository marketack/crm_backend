import mongoose, { Schema } from "mongoose";
const SaaSToolSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    url: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
export default mongoose.model("SaaSTool", SaaSToolSchema);
