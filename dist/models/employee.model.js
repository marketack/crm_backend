import mongoose, { Schema } from "mongoose";
const EmployeeSchema = new Schema({
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
}, { timestamps: true });
export const Employee = mongoose.model("Employee", EmployeeSchema);
