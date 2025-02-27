import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  company: { type: String },
  jobTitle: { type: String },
  industry: { type: String }, // Helps in AI segmentation
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  source: { type: String, enum: ["Facebook", "LinkedIn", "Google Ads", "Referral", "Other"], required: true },
  status: { type: String, enum: ["new", "contacted", "qualified", "proposal_sent", "closed", "lost"], default: "new" },
  tags: [{ type: String }],

  aiScore: { type: Number, default: 50 }, // AI-driven lead scoring
  aiPriority: { type: String, enum: ["low", "medium", "high"], default: "medium" }, // AI calculates urgency
  aiRecommendations: [{ type: String }], // AI suggests next actions

  whatsappChat: [{
    messageId: String,
    sender: String,
    message: String,
    timestamp: Date
  }], // WhatsApp Chat Data

  emailHistory: [{
    subject: String,
    body: String,
    sentAt: Date
  }], // Email tracking

  callHistory: [{
    duration: Number,
    notes: String,
    callDate: Date
  }], // Call tracking

  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Lead = mongoose.model("Lead", LeadSchema);
export default Lead;
