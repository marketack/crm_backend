import express from "express";
import {
  getCompanyDetails,
  getAboutUs,
  getTeam,
  getContactUs,
  getBlogs,
  updateAboutUs,
  updateTeam,
  updateContactUs,
  addBlogPost,
  sendNewsletter,
  getServices,
  addService,
  updateService,
  deleteService,
  getBlogBySlug,
  incrementBlogViews,
  addComment,
} from "../controllers/cms.controller";

import { verifyJWT, requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// ✅ Public APIs
router.get("/details", getCompanyDetails);
router.get("/about-us", getAboutUs);
router.get("/team", getTeam);
router.get("/contact-us", getContactUs);
router.get("/blogs", getBlogs);
router.get("/blogs/:slug", getBlogBySlug);
router.put("/blogs/:slug/views", incrementBlogViews);
router.post("/blogs/:slug/comment", verifyJWT, addComment);
router.get("/services", getServices);

// ✅ Admin APIs (CMS Management)
router.put("/about-us", verifyJWT, requireAdmin, updateAboutUs);
router.put("/team", verifyJWT, requireAdmin, updateTeam);
router.put("/contact-us", verifyJWT, requireAdmin, updateContactUs);
router.post("/blogs", verifyJWT, requireAdmin, addBlogPost); // ✅ Changed `add-blog` to `blogs`
router.post("/send-newsletter", verifyJWT, requireAdmin, sendNewsletter);

// ✅ Services Management (Admin only)
router.post("/services", verifyJWT, requireAdmin, addService);
router.put("/services", verifyJWT, requireAdmin, updateService);
router.delete("/services/:serviceId", verifyJWT, requireAdmin, deleteService);

export default router;
