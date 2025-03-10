import mongoose, { Schema } from "mongoose";
// ✅ Define File Schema
const FileSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: { type: String, required: true },
    size: { type: Number, required: true },
}, { timestamps: true });
// ✅ Export File Model
export const File = mongoose.model("File", FileSchema);
