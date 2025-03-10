var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose, { Schema } from "mongoose";
// ✅ Define Blog Schema
const BlogSchema = new Schema({
    title: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true }, // ✅ Short blog preview
    images: { type: [String], default: [] },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tags: { type: [String], default: [], index: true },
    category: { type: String, default: "General" },
    isPublished: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    publishedAt: { type: Date },
    comments: [
        {
            user: { type: Schema.Types.ObjectId, ref: "User" },
            comment: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });
// ✅ Auto-generate slug before saving
BlogSchema.pre("save", function (next) {
    if (this.isModified("title")) {
        this.slug = this.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    }
    next();
});
// ✅ Increase View Count
BlogSchema.methods.incrementViews = function () {
    return __awaiter(this, void 0, void 0, function* () {
        this.views += 1;
        yield this.save();
    });
};
const Blog = mongoose.model("Blog", BlogSchema);
export default Blog;
