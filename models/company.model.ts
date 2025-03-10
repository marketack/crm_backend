import mongoose, { Document, Schema, Model, Types } from "mongoose";

/** ✅ Service Schema */
interface IService {
  title: string;
  description: string;
  price?: number;
  features: string[];
}

/** ✅ Department Schema (Embedded Inside Company) */
interface IDepartment {
  _id?: Types.ObjectId;
  name: string;
  employees: Types.ObjectId[]; // ✅ Stores employees assigned to this department
  budget: number;
  objectives: string[];
}

/** ✅ Company Interface */
export interface ICompany extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  industry: string;
  aboutUs: string;
  employees: Types.ObjectId[]; // ✅ General company-wide employees
  departments: IDepartment[]; // ✅ Stores default departments
  contactUs: {
    email: string;
    phone: string;
    address?: string;
  };
  services: IService[];
  blogPosts: Types.ObjectId[];
  newsletterSubscribers: Types.ObjectId[];
  subscriptionPlan: "free" | "premium" | "enterprise";
  subscriptionStatus: "active" | "expired" | "canceled";
  subscriptionExpiresAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/** ✅ Define Service Schema */
const ServiceSchema = new Schema<IService>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, default: 0 },
  features: { type: [String], default: [] },
});

/** ✅ Define Department Schema (Embedded Inside Company) */
const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true },
    employees: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }], // ✅ Employees assigned to this department
    budget: { type: Number, required: true, default: 0 },
    objectives: [{ type: String, required: true, default: [] }],
  },
  { _id: true }
);

/** ✅ Define Company Schema */
const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    website: { type: String, required: true },
    industry: { type: String, required: true },
    aboutUs: { type: String, required: true, default: "" },
    employees: [{ type: Schema.Types.ObjectId, ref: "User", required: true, default: [] }], // ✅ Company-wide employees
    departments: { type: [DepartmentSchema], required: true, default: [] }, // ✅ Default departments exist
    contactUs: {
      email: { type: String, required: true, validate: /\S+@\S+\.\S+/ }, // ✅ Ensure it's a valid email
      phone: { type: String, required: true, validate: /^[+]?[\d\s()-]{7,15}$/ }, // ✅ Ensure it's a valid phone number
      address: { type: String, default: "" },
    },
    services: { type: [ServiceSchema], default: [] },
    blogPosts: [{ type: Schema.Types.ObjectId, ref: "Blog", default: [] }],
    newsletterSubscribers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    subscriptionPlan: { type: String, enum: ["free", "premium", "enterprise"], default: "free" },
    subscriptionStatus: { type: String, enum: ["active", "expired", "canceled"], default: "active" },
    subscriptionExpiresAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);


/** ✅ Auto-Create Default Departments Before Saving */
CompanySchema.pre<ICompany>("save", function (next) {
  if (this.departments.length === 0) {
    this.departments = [
      { name: "General Management", employees: [], budget: 200000, objectives: ["Oversee operations"] },
      { name: "Human Resources", employees: [], budget: 100000, objectives: ["Manage employees and benefits"] },
      { name: "Finance", employees: [], budget: 120000, objectives: ["Manage company finances"] },
      { name: "IT Department", employees: [], budget: 150000, objectives: ["Handle technology and support"] },
      { name: "Marketing", employees: [], budget: 90000, objectives: ["Handle advertising and public relations"] },
    ];
  }
  next();
});

const Company: Model<ICompany> = mongoose.model<ICompany>("Company", CompanySchema);
export default Company;
