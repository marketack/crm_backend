import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true },
    type: { type: String, enum: ["image", "video", "document"], required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Media = mongoose.model("Media", MediaSchema);
export default Media;
