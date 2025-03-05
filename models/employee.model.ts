import mongoose, { Schema, Document, Model } from "mongoose";

interface IEmployee extends Document {
  name: string;
  email: string;
  position: string;
  department: mongoose.Types.ObjectId;
  salary: number;
  performanceReviews: { date: Date; review: string; rating: number }[];
  reportsTo?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    position: { type: String, required: true },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    salary: { type: Number, required: true },
    performanceReviews: [
      {
        date: { type: Date, default: Date.now },
        review: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
      },
    ],
    reportsTo: { type: Schema.Types.ObjectId, ref: "Employee", default: null },
  },
  { timestamps: true }
);

export const Employee: Model<IEmployee> = mongoose.model<IEmployee>("Employee", EmployeeSchema);
