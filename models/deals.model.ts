import mongoose from "mongoose";

const DealSchema = new mongoose.Schema({
  dealName: { type: String, required: true },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: "Contact", required: true },
  value: { type: Number, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Salesperson handling the deal
  status: { 
    type: String, 
    enum: ["prospecting", "proposal_sent", "negotiating", "closed_won", "closed_lost"], 
    required: true 
  },
  
  expectedCloseDate: { type: Date },
  closedDate: { type: Date },

  aiProbabilityOfClosure: { type: Number, default: 50 }, // AI estimates deal closure %
  aiBestNegotiationStrategy: { type: String }, // AI suggests the best strategy
  aiRedFlags: [{ type: String }], // AI detects any warning signs

  meetingNotes: [{
    date: Date,
    summary: String
  }], // Logs meetings & interactions

  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Deal = mongoose.model("Deal", DealSchema);
export default Deal;
