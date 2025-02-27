import mongoose from "mongoose";

const SeoSchema = new mongoose.Schema({
  page: { type: String, required: true },
  metaTitle: { type: String, required: true },
  metaDescription: { type: String, required: true },
  keywords: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Seo = mongoose.model("Seo", SeoSchema);
export default Seo;
