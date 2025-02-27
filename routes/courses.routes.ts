import express from "express";
import {
  getCourses,
  createCourse,
  enrollCourse,
  updateCourse,
  deleteCourse,
  checkEnrollment,
} from "../controllers/courseController";
import { verifyJWT, requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management API
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of courses retrieved successfully
 */
router.get("/", getCourses);

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course (Authenticated Users)
 *     security:
 *       - BearerAuth: []
 *     tags: [Courses]
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
 *     responses:
 *       201:
 *         description: Course created successfully
 */
router.post("/", verifyJWT, createCourse);

/**
 * @swagger
 * /courses/enroll:
 *   post:
 *     summary: Enroll in a course (Authenticated Users)
 *     security:
 *       - BearerAuth: []
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully enrolled in the course
 */
router.post("/enroll", verifyJWT, enrollCourse);

/**
 * @swagger
 * /courses/{courseId}:
 *   put:
 *     summary: Update course details (Admins & Course Creator Only)
 *     security:
 *       - BearerAuth: []
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Course updated successfully
 */
router.put("/:courseId", verifyJWT, requireAdmin, updateCourse);

/**
 * @swagger
 * /courses/{courseId}:
 *   delete:
 *     summary: Delete a course (Admins & Course Creator Only)
 *     security:
 *       - BearerAuth: []
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted successfully
 */
router.delete("/:courseId", verifyJWT, requireAdmin, deleteCourse);

/**
 * @swagger
 * /courses/check-enrollment/{courseId}:
 *   get:
 *     summary: Check if a user is enrolled in a course
 *     security:
 *       - BearerAuth: []
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enrollment status retrieved successfully
 */
router.get("/check-enrollment/:courseId", verifyJWT, checkEnrollment);

export default router;
