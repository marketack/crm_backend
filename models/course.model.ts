import mongoose, { Document, Schema } from "mongoose";

export interface ICourse extends Document {
  title: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  price: number;
  content: string[];
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Fixed field name
    price: { type: Number, required: true },
    content: [{ type: String, required: true }],
  },
  { timestamps: true }
);

export default mongoose.model<ICourse>("Course", CourseSchema);
