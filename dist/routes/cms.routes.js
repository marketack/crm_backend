import express from "express";
import { getCompanyDetails, getAboutUs, getTeam, getContactUs, getBlogs, updateAboutUs, updateTeam, updateContactUs, addBlogPost, sendNewsletter, getServices, addService, updateService, deleteService, getBlogBySlug, incrementBlogViews, addComment, } from "../controllers/cms.controller";
import { verifyJWT, requireAdmin } from "../middleware/authMiddleware";
const router = express.Router();
/**
 * @swagger
 * tags:
 *   - name: CMS
 *     description: Content Management System (CMS) APIs
 *   - name: Blogs
 *     description: Manage blog posts
 *   - name: Services
 *     description: Manage services
 */
/**
 * @swagger
 * /cms/details:
 *   get:
 *     summary: Get company details
 *     tags: [CMS]
 *     responses:
 *       200:
 *         description: Company details retrieved successfully
 */
router.get("/details", getCompanyDetails);
/**
 * @swagger
 * /cms/about-us:
 *   get:
 *     summary: Get About Us content
 *     tags: [CMS]
 *     responses:
 *       200:
 *         description: About Us content retrieved successfully
 */
router.get("/about-us", getAboutUs);
/**
 * @swagger
 * /cms/team:
 *   get:
 *     summary: Get team members
 *     tags: [CMS]
 *     responses:
 *       200:
 *         description: Team members retrieved successfully
 */
router.get("/team", getTeam);
/**
 * @swagger
 * /cms/contact-us:
 *   get:
 *     summary: Get contact information
 *     tags: [CMS]
 *     responses:
 *       200:
 *         description: Contact information retrieved successfully
 */
router.get("/contact-us", getContactUs);
/**
 * @swagger
 * /cms/blogs:
 *   get:
 *     summary: Get all published blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: Blog list retrieved successfully
 */
router.get("/blogs", getBlogs);
/**
 * @swagger
 * /cms/blogs/{slug}:
 *   get:
 *     summary: Get a single blog by slug
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique slug of the blog
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *       404:
 *         description: Blog not found
 */
router.get("/blogs/:slug", getBlogBySlug);
/**
 * @swagger
 * /cms/blogs/{slug}/views:
 *   put:
 *     summary: Increment blog view count
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique slug of the blog
 *     responses:
 *       200:
 *         description: View count updated
 *       404:
 *         description: Blog not found
 */
router.put("/blogs/:slug/views", incrementBlogViews);
/**
 * @swagger
 * /cms/blogs/{slug}/comment:
 *   post:
 *     summary: Add a comment to a blog
 *     tags: [Blogs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique slug of the blog
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment added successfully
 */
router.post("/blogs/:slug/comment", verifyJWT, addComment);
/**
 * @swagger
 * /cms/services:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of services
 */
router.get("/services", getServices);
/**
 * @swagger
 * /cms/blogs:
 *   post:
 *     summary: Add a new blog post
 *     tags: [Blogs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Blog post created successfully
 */
router.post("/blogs", verifyJWT, requireAdmin, addBlogPost);
/**
 * @swagger
 * /cms/send-newsletter:
 *   post:
 *     summary: Send a newsletter to subscribers
 *     tags: [CMS]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Newsletter sent successfully
 */
router.post("/send-newsletter", verifyJWT, requireAdmin, sendNewsletter);
/**
 * @swagger
 * /cms/about-us:
 *   put:
 *     summary: Update About Us section
 *     tags: [CMS]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               aboutUs:
 *                 type: string
 *                 description: The updated content for the About Us section
 *     responses:
 *       200:
 *         description: About Us section updated successfully
 *       400:
 *         description: Invalid request data
 */
router.put("/about-us", verifyJWT, requireAdmin, updateAboutUs);
/**
 * @swagger
 * /cms/team:
 *   put:
 *     summary: Update team members
 *     tags: [CMS]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     position:
 *                       type: string
 *                     image:
 *                       type: string
 *                 description: List of team members with name, position, and image URL
 *     responses:
 *       200:
 *         description: Team members updated successfully
 *       400:
 *         description: Invalid request data
 */
router.put("/team", verifyJWT, requireAdmin, updateTeam);
/**
 * @swagger
 * /cms/contact-us:
 *   put:
 *     summary: Update contact information
 *     tags: [CMS]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *                 description: Updated contact details
 *     responses:
 *       200:
 *         description: Contact information updated successfully
 *       400:
 *         description: Invalid request data
 */
router.put("/contact-us", verifyJWT, requireAdmin, updateContactUs);
/**
 * @swagger
 * /cms/services:
 *   post:
 *     summary: Add a new service
 *     tags: [Services]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Service added successfully
 *       400:
 *         description: Invalid request data
 */
router.post("/services", verifyJWT, requireAdmin, addService);
/**
 * @swagger
 * /cms/services:
 *   put:
 *     summary: Update an existing service
 *     tags: [Services]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceId:
 *                 type: string
 *                 description: The ID of the service to update
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Service not found
 */
router.put("/services", verifyJWT, requireAdmin, updateService);
/**
 * @swagger
 * /cms/services/{serviceId}:
 *   delete:
 *     summary: Delete a service
 *     tags: [Services]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the service to delete
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       404:
 *         description: Service not found
 */
router.delete("/services/:serviceId", verifyJWT, requireAdmin, deleteService);
export default router;
