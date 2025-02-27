import mongoose from "mongoose";

const LogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    ip: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Log = mongoose.model("Log", LogSchema);
export default Log;
