import mongoose from "mongoose";

const AiSalesPredictionSchema = new mongoose.Schema({
  deal: { type: mongoose.Schema.Types.ObjectId, ref: "project", required: true },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: "customer", required: true },
  probabilityOfClosure: { type: Number, default: 50 },
  bestNegotiationStrategy: { type: String },
  riskFactor: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const AiSalesPrediction = mongoose.model("AiSalesPrediction", AiSalesPredictionSchema);
export default AiSalesPrediction;
