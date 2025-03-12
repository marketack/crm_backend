import { Request, Response, NextFunction } from "express";
import Company from "../models/company.model";
import User from "../models/user.model";
import Blog from "../models/blog.model";
import sendEmail from "../utils/emailService";
import slugify from "slugify"; // ✅ Slug Generation


interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    company?: string | null;
  };
}
/**
 * ✅ Get Company Details
 */
export const getCompanyDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await Company.findOne()
      .populate("team", "name position email")
      .populate("blogPosts", "title createdAt")
      .populate("newsletterSubscribers", "email");

    res.status(200).json({ success: true, company });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Get About Us Data
 */
export const getAboutUs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await Company.findOne().select("aboutUs");
    res.status(200).json({ success: true, aboutUs: company?.aboutUs });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Update About Us
 */


export const updateAboutUs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { aboutUs } = req.body;

    if (!aboutUs) {
      res.status(400).json({ success: false, message: "About Us content is required" });
      return; // ✅ Return void explicitly
    }

    let company = await Company.findOne();

    if (!company) {
      company = new Company({ aboutUs });
    } else {
      company.aboutUs = aboutUs;
    }

    await company.save(); // ✅ Ensure changes are saved

    res.status(200).json({ success: true, message: "About Us updated successfully", aboutUs: company.aboutUs });
    return; // ✅ Ensures function returns void
  } catch (error) {
    next(error); // ✅ Ensures Express handles errors properly
    return; // ✅ Ensures function still returns void
  }
};


/**
 * ✅ Get Team Members
 */
export const getTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await Company.findOne().populate("employees", "name position email profileImage");

    if (!company || !company.employees) {
      res.status(404).json({ success: false, message: "No team members found." });
      return;
    }

    res.status(200).json({ success: true, employees: company.employees });
  } catch (error) {
    next(error);
  }
};


/**
 * ✅ Update Team Members
 */
export const updateTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { team } = req.body; // Array of team members [{name, position, image}]
    const company = await Company.findOneAndUpdate({}, { team }, { new: true });
    res.status(200).json({ success: true, message: "Updated successfully", team: company?.employees });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Get Contact Information
 */
export const getContactUs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await Company.findOne().select("contactUs");
    res.status(200).json({ success: true, contact: company?.contactUs });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Update Contact Information
 */
export const updateContactUs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone, address } = req.body;
    const company = await Company.findOneAndUpdate({}, { contactUs: { email, phone, address } }, { new: true });
    res.status(200).json({ success: true, message: "Updated successfully", contact: company?.contactUs });
  } catch (error) {
    next(error);
  }
};

export const addBlogPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    await newBlog.save();

    res.status(201).json({
      success: true,
      message: "✅ Blog added successfully!",
      blog: newBlog,
    });
    return;
  } catch (error) {
    next(error);
  }
};


// ✅ Get All Blogs
export const getBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10, category, featured } = req.query;
    const query: any = { isPublished: true };

    if (category) query.category = category;
    if (featured) query.featured = featured === "true";

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("author", "name email");

    const totalBlogs = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      blogs,
      pagination: {
        totalPages: Math.ceil(totalBlogs / Number(limit)),
        currentPage: Number(page),
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};


// ✅ Get Single Blog by Slug
export const getBlogBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug }).populate("author", "name email");

    if (!blog) {
      res.status(404).json({ success: false, message: "Blog not found." });
      return;
    }

    res.status(200).json({ success: true, blog });
    return;
  } catch (error) {
    next(error);
  }
};


// ✅ Increment Views
export const incrementBlogViews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug });

    if (!blog) {
      res.status(404).json({ success: false, message: "Blog not found." });
      return;
    }

    blog.views += 1;
    await blog.save();

    res.status(200).json({ success: true, message: "✅ View count updated!" });
    return;
  } catch (error) {
    next(error);
  }
};


// ✅ Add Comment to Blog
export const addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const { userId, comment } = req.body;

    if (!userId || !comment) {
      res.status(400).json({ success: false, message: "User and comment are required." });
      return;
    }

    const blog = await Blog.findOne({ slug });

    if (!blog) {
      res.status(404).json({ success: false, message: "Blog not found." });
      return;
    }

    blog.comments.push({ user: userId, comment, createdAt: new Date() });
    await blog.save();

    res.status(200).json({ success: true, message: "✅ Comment added!", blog });
    return;
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Get Subscription Details
 */
export const getSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await Company.findOne().select("subscriptionPlan subscriptionStatus subscriptionExpiresAt");
    res.status(200).json({ success: true, subscription: company });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Update Subscription Plan
 */
export const updateSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { plan, status, expiresAt } = req.body;
    const company = await Company.findOneAndUpdate(
      {},
      { subscriptionPlan: plan, subscriptionStatus: status, subscriptionExpiresAt: expiresAt },
      { new: true }
    );
    res.status(200).json({ success: true, message: "Subscription updated", subscription: company });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Send Newsletter Email
 */
export const sendNewsletter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subject, content } = req.body;
    await sendNewsletterToUsers({ title: subject, content });

    res.status(200).json({ success: true, message: "Newsletter sent to subscribers" });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Function to Send Newsletter to Users
 */
const sendNewsletterToUsers = async (blog: { title: string; content: string }) => {
  const users = await User.find({ subscriptionStatus: "active" }).select("email");
  const emails = users.map((user) => user.email);

  const subject = `New Blog: ${blog.title}`;
  const message = `
    <h2>${blog.title}</h2>
    <p>${blog.content.substring(0, 150)}...</p>
    <p><a href="https://yourwebsite.com/blogs">Read more</a></p>
  `;

  await sendEmail(emails, subject, message);
};

/**
 * ✅ Get All Services
 */
export const getServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await Company.findOne().select("services");
    res.status(200).json({ success: true, services: company?.services || [] });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Add a New Service
 */
export const addService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, features } = req.body;

    const newService = { title, description, features };
    const company = await Company.findOneAndUpdate({}, { $push: { services: newService } }, { new: true });

    res.status(201).json({ success: true, message: "Service added successfully", services: company?.services });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Update an Existing Service
 */
export const updateService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceId, title, description, price, features } = req.body;

    const company = await Company.findOneAndUpdate(
      { "services._id": serviceId },
      { $set: { "services.$.title": title, "services.$.description": description, "services.$.price": price, "services.$.features": features } },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Service updated successfully", services: company?.services });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Delete a Service
 */
export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceId } = req.params;

    const company = await Company.findOneAndUpdate({}, { $pull: { services: { _id: serviceId } } }, { new: true });

    res.status(200).json({ success: true, message: "Service deleted successfully", services: company?.services });
  } catch (error) {
    next(error);
  }
};