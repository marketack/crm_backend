import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String },
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true },
  type: { type: String, enum: ["lead", "customer", "partner"], required: true },
  status: { 
    type: String, 
    enum: ["new", "contacted", "qualified", "proposal_sent", "closed", "active", "inactive"], 
    default: "new" 
  },
  source: { type: String, enum: ["Facebook", "LinkedIn", "Google Ads", "Referral", "Other"], required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tags: [{ type: String }], // Custom user-defined tags
  billingAddress: { street: String, city: String, state: String, zipCode: String, country: String },
  shippingAddress: { street: String, city: String, state: String, zipCode: String, country: String },
  totalRevenue: { type: Number, default: 0 },
  leadScore: { type: Number, default: 50 }, // AI-powered conversion score
  aiInsights: {
    engagementScore: { type: Number, default: 50 },
    predictedNeeds: [{ type: String }],
    riskFactor: { type: Number, default: 0 },
  },
  whatsappMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "WhatsAppMessage" }], // Linked WhatsApp chat
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Contact = mongoose.model("Contact", ContactSchema);
export default Contact;
