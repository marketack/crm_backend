import mongoose from "mongoose";

const AiContactInsightsSchema = new mongoose.Schema({
  contact: { type: mongoose.Schema.Types.ObjectId, ref: "Contact", required: true },
  engagementScore: { type: Number, default: 50 },
  churnRisk: { type: Number, default: 0 },
  recommendedActions: [{ type: String }],
}, { timestamps: true });

const AiContactInsights = mongoose.model("AiContactInsights", AiContactInsightsSchema);
export default AiContactInsights;
