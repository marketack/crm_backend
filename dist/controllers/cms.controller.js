var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Company from "../models/company.model";
import User from "../models/user.model";
import Blog from "../models/blog.model";
import sendEmail from "../utils/emailService";
import slugify from "slugify"; // ✅ Slug Generation
/**
 * ✅ Get Company Details
 */
export const getCompanyDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const company = yield Company.findOne()
            .populate("team", "name position email")
            .populate("blogPosts", "title createdAt")
            .populate("newsletterSubscribers", "email");
        res.status(200).json({ success: true, company });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Get About Us Data
 */
export const getAboutUs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const company = yield Company.findOne().select("aboutUs");
        res.status(200).json({ success: true, aboutUs: company === null || company === void 0 ? void 0 : company.aboutUs });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Update About Us
 */
export const updateAboutUs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { aboutUs } = req.body;
        if (!aboutUs) {
            res.status(400).json({ success: false, message: "About Us content is required" });
            return; // ✅ Return void explicitly
        }
        let company = yield Company.findOne();
        if (!company) {
            company = new Company({ aboutUs });
        }
        else {
            company.aboutUs = aboutUs;
        }
        yield company.save(); // ✅ Ensure changes are saved
        res.status(200).json({ success: true, message: "About Us updated successfully", aboutUs: company.aboutUs });
        return; // ✅ Ensures function returns void
    }
    catch (error) {
        next(error); // ✅ Ensures Express handles errors properly
        return; // ✅ Ensures function still returns void
    }
});
/**
 * ✅ Get Team Members
 */
export const getTeam = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const company = yield Company.findOne().populate("team", "name position email image");
        res.status(200).json({ success: true, team: company === null || company === void 0 ? void 0 : company.team });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Update Team Members
 */
export const updateTeam = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { team } = req.body; // Array of team members [{name, position, image}]
        const company = yield Company.findOneAndUpdate({}, { team }, { new: true });
        res.status(200).json({ success: true, message: "Updated successfully", team: company === null || company === void 0 ? void 0 : company.team });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Get Contact Information
 */
export const getContactUs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const company = yield Company.findOne().select("contactUs");
        res.status(200).json({ success: true, contact: company === null || company === void 0 ? void 0 : company.contactUs });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Update Contact Information
 */
export const updateContactUs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, phone, address } = req.body;
        const company = yield Company.findOneAndUpdate({}, { contactUs: { email, phone, address } }, { new: true });
        res.status(200).json({ success: true, message: "Updated successfully", contact: company === null || company === void 0 ? void 0 : company.contactUs });
    }
    catch (error) {
        next(error);
    }
});
export const addBlogPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, content, excerpt, images, author, category, tags, featured } = req.body;
        if (!title || !content || !author || !excerpt) {
            res.status(400).json({
                success: false,
                message: "All required fields (title, content, author, excerpt) must be provided.",
            });
            return;
        }
        const slug = slugify(title, { lower: true, strict: true });
        // ✅ Calculate estimated reading time (assuming 200 words per minute)
        const wordCount = content.split(" ").length;
        const readingTime = Math.ceil(wordCount / 200);
        const newBlog = new Blog({
            title,
            slug,
            content,
            excerpt,
            images: images || [],
            author,
            category: category || "General",
            tags: tags || [],
            featured: featured || false,
            publishedAt: new Date(),
            views: 0,
            readingTime,
            comments: [], // ✅ Initialize an empty array for comments
        });
        yield newBlog.save();
        res.status(201).json({
            success: true,
            message: "✅ Blog added successfully!",
            blog: newBlog,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
// ✅ Get All Blogs
export const getBlogs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, category, featured } = req.query;
        const query = { isPublished: true };
        if (category)
            query.category = category;
        if (featured)
            query.featured = featured === "true";
        const blogs = yield Blog.find(query)
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .populate("author", "name email");
        const totalBlogs = yield Blog.countDocuments(query);
        res.status(200).json({
            success: true,
            blogs,
            pagination: {
                totalPages: Math.ceil(totalBlogs / Number(limit)),
                currentPage: Number(page),
            },
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
// ✅ Get Single Blog by Slug
export const getBlogBySlug = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const blog = yield Blog.findOne({ slug }).populate("author", "name email");
        if (!blog) {
            res.status(404).json({ success: false, message: "Blog not found." });
            return;
        }
        res.status(200).json({ success: true, blog });
        return;
    }
    catch (error) {
        next(error);
    }
});
// ✅ Increment Views
export const incrementBlogViews = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const blog = yield Blog.findOne({ slug });
        if (!blog) {
            res.status(404).json({ success: false, message: "Blog not found." });
            return;
        }
        blog.views += 1;
        yield blog.save();
        res.status(200).json({ success: true, message: "✅ View count updated!" });
        return;
    }
    catch (error) {
        next(error);
    }
});
// ✅ Add Comment to Blog
export const addComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const { userId, comment } = req.body;
        if (!userId || !comment) {
            res.status(400).json({ success: false, message: "User and comment are required." });
            return;
        }
        const blog = yield Blog.findOne({ slug });
        if (!blog) {
            res.status(404).json({ success: false, message: "Blog not found." });
            return;
        }
        blog.comments.push({ user: userId, comment, createdAt: new Date() });
        yield blog.save();
        res.status(200).json({ success: true, message: "✅ Comment added!", blog });
        return;
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Get Subscription Details
 */
export const getSubscription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const company = yield Company.findOne().select("subscriptionPlan subscriptionStatus subscriptionExpiresAt");
        res.status(200).json({ success: true, subscription: company });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Update Subscription Plan
 */
export const updateSubscription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { plan, status, expiresAt } = req.body;
        const company = yield Company.findOneAndUpdate({}, { subscriptionPlan: plan, subscriptionStatus: status, subscriptionExpiresAt: expiresAt }, { new: true });
        res.status(200).json({ success: true, message: "Subscription updated", subscription: company });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Send Newsletter Email
 */
export const sendNewsletter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subject, content } = req.body;
        yield sendNewsletterToUsers({ title: subject, content });
        res.status(200).json({ success: true, message: "Newsletter sent to subscribers" });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Function to Send Newsletter to Users
 */
const sendNewsletterToUsers = (blog) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User.find({ subscriptionStatus: "active" }).select("email");
    const emails = users.map((user) => user.email);
    const subject = `New Blog: ${blog.title}`;
    const message = `
    <h2>${blog.title}</h2>
    <p>${blog.content.substring(0, 150)}...</p>
    <p><a href="https://yourwebsite.com/blogs">Read more</a></p>
  `;
    yield sendEmail(emails, subject, message);
});
/**
 * ✅ Get All Services
 */
export const getServices = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const company = yield Company.findOne().select("services");
        res.status(200).json({ success: true, services: (company === null || company === void 0 ? void 0 : company.services) || [] });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Add a New Service
 */
export const addService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, features } = req.body;
        const newService = { title, description, features };
        const company = yield Company.findOneAndUpdate({}, { $push: { services: newService } }, { new: true });
        res.status(201).json({ success: true, message: "Service added successfully", services: company === null || company === void 0 ? void 0 : company.services });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Update an Existing Service
 */
export const updateService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serviceId, title, description, price, features } = req.body;
        const company = yield Company.findOneAndUpdate({ "services._id": serviceId }, { $set: { "services.$.title": title, "services.$.description": description, "services.$.price": price, "services.$.features": features } }, { new: true });
        res.status(200).json({ success: true, message: "Service updated successfully", services: company === null || company === void 0 ? void 0 : company.services });
    }
    catch (error) {
        next(error);
    }
});
/**
 * ✅ Delete a Service
 */
export const deleteService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serviceId } = req.params;
        const company = yield Company.findOneAndUpdate({}, { $pull: { services: { _id: serviceId } } }, { new: true });
        res.status(200).json({ success: true, message: "Service deleted successfully", services: company === null || company === void 0 ? void 0 : company.services });
    }
    catch (error) {
        next(error);
    }
});
