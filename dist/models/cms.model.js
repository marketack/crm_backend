import mongoose, { Schema } from "mongoose";
import slugify from "slugify";
const CMSchema = new Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true },
    content: { type: String, required: true },
    status: { type: String, enum: ["published", "draft", "archived"], default: "draft" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
// ✅ Generate slug before saving
CMSchema.pre("save", function (next) {
    if (!this.slug || this.isModified("title")) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    next();
});
// ✅ Index for fast searches
CMSchema.index({ title: "text", content: "text" });
const CMS = mongoose.models.CMS || mongoose.model("CMS", CMSchema);
export default CMS;
