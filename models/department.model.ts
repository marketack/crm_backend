import mongoose, { Schema, Document, Model } from "mongoose";

interface IDepartment extends Document {
  name: string;
  parentDepartment?: mongoose.Types.ObjectId;
  employees: mongoose.Types.ObjectId[];
  budget: number;
  objectives: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true },
    parentDepartment: { type: Schema.Types.ObjectId, ref: "Department", default: null },
    employees: [{ type: Schema.Types.ObjectId, ref: "Employee" }],
    budget: { type: Number, default: 0 },
    objectives: [{ type: String }],
  },
  { timestamps: true }
);

export const Department: Model<IDepartment> = mongoose.model<IDepartment>("Department", DepartmentSchema);
