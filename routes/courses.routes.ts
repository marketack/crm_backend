import express from "express";
import {
  getCourses,
  createCourse,
  reviewCourse,
  enrollCourse,
  updateCourse,
  deleteCourse,
  addLesson,
} from "../controllers/courseController";
import { verifyJWT, requireRole } from "../middleware/authMiddleware";

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: API for managing courses
 */
const router = express.Router();

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get("/", getCourses);

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
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
 *     responses:
 *       201:
 *         description: Course created successfully
 */
router.post("/", verifyJWT, requireRole(["admin", "instructor"]), createCourse);

/**
 * @swagger
 * /courses/review/{courseId}:
 *   put:
 *     summary: Approve or reject a course
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
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
 *               status:
 *                 type: string
 *                 enum: ["approved", "rejected"]
 *     responses:
 *       200:
 *         description: Course reviewed successfully
 */
router.put("/review/:courseId", verifyJWT, requireRole(["admin", "owner"]), reviewCourse);

/**
 * @swagger
 * /courses/enroll:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
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
 *         description: Enrolled successfully
 */
router.post("/enroll", verifyJWT, enrollCourse);

/**
 * @swagger
 * /courses/{courseId}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
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
router.put("/:courseId", verifyJWT, requireRole(["admin", "instructor"]), updateCourse);

/**
 * @swagger
 * /courses/{courseId}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
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
router.delete("/:courseId", verifyJWT, requireRole(["admin", "instructor"]), deleteCourse);

/**
 * @swagger
 * /courses/{courseId}/lessons:
 *   post:
 *     summary: Add a lesson to a course
 *     tags: [Courses]
 *     security:
 *       - BearerAuth: []
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
 *               content:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lesson added successfully
 */
router.post("/:courseId/lessons", verifyJWT, requireRole(["admin", "instructor"]), addLesson);

export default router;
