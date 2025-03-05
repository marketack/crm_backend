import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ✅ Define File Interface
export interface IFile extends Document {
  user: Types.ObjectId;
  filename: string;
  filePath: string;
  fileType: string;
  size: number;
  createdAt: Date;
}

// ✅ Define File Schema
const FileSchema = new Schema<IFile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: true }
);

// ✅ Export File Model
export const File: Model<IFile> = mongoose.model<IFile>("File", FileSchema);
