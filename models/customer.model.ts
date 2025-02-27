import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  vatNumber: { type: String }, // Tax ID for invoicing
  website: { type: String },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  groups: [{ type: String }], // Segmentation tags
  currency: { type: String, default: "USD" },
  language: { type: String, default: "English" },
  totalRevenue: { type: Number, default: 0 },
  aiInsights: {
    engagementScore: { type: Number, default: 50 }, // AI-driven metric
    predictedNeeds: [{ type: String }], // AI-generated customer needs
    riskFactor: { type: Number, default: 0 }, // AI detects potential issues
  },
  whatsappChat: [{
    messageId: String,
    sender: String,
    message: String,
    timestamp: Date
  }], // WhatsApp Chat Data
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Customer = mongoose.model("Customer", CustomerSchema);
export default Customer;
