import mongoose, { Schema, Document, Model } from "mongoose";
import slugify from "slugify";

export interface ICMS extends Document {
  title: string;
  slug: string;
  content: string;
  status: "published" | "draft" | "archived";
  createdBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CMSchema = new Schema<ICMS>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true },
    content: { type: String, required: true },
    status: { type: String, enum: ["published", "draft", "archived"], default: "draft" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Generate slug before saving
CMSchema.pre<ICMS>("save", function (next) {
  if (!this.slug || this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// ✅ Index for fast searches
CMSchema.index({ title: "text", content: "text" });

const CMS: Model<ICMS> = mongoose.models.CMS || mongoose.model<ICMS>("CMS", CMSchema);
export default CMS;
