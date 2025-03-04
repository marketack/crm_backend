import mongoose, { Document, Schema, Model, Types } from "mongoose";

// ✅ Define Blog Interface
export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  images: string[];
  author: Types.ObjectId;
  tags: string[];
  category: string;
  isPublished: boolean;
  featured: boolean;
  views: number;
  publishedAt?: Date;
  comments: { user: Types.ObjectId; comment: string; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Define Blog Schema
const BlogSchema = new Schema<IBlog>(
  {
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
  },
  { timestamps: true }
);

// ✅ Auto-generate slug before saving
BlogSchema.pre<IBlog>("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
  }
  next();
});

// ✅ Increase View Count
BlogSchema.methods.incrementViews = async function () {
  this.views += 1;
  await this.save();
};

const Blog: Model<IBlog> = mongoose.model<IBlog>("Blog", BlogSchema);
export default Blog;
