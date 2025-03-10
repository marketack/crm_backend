import mongoose, { Schema } from "mongoose";
const DepartmentSchema = new Schema({
    name: { type: String, required: true, unique: true },
    parentDepartment: { type: Schema.Types.ObjectId, ref: "Department", default: null },
    employees: [{ type: Schema.Types.ObjectId, ref: "Employee" }],
    budget: { type: Number, default: 0 },
    objectives: [{ type: String }],
}, { timestamps: true });
export const Department = mongoose.model("Department", DepartmentSchema);
