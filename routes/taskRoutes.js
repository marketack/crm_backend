const express = require("express");
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const passport = require("passport");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management API
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     description: Adds a new task to the system. Requires JWT authentication.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: Fix server issues
 *               description:
 *                 type: string
 *                 example: Investigate and resolve reported downtime
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized - User not authenticated
 */
router.post("/", passport.authenticate("jwt", { session: false }), createTask);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Retrieves a list of all tasks. Requires JWT authentication.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 61c4c5f4a3b2f8a37e543dcb
 *                   title:
 *                     type: string
 *                     example: Fix server issues
 *                   description:
 *                     type: string
 *                     example: Investigate and resolve reported downtime
 *       401:
 *         description: Unauthorized - User not authenticated
 */
router.get("/", passport.authenticate("jwt", { session: false }), getAllTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     description: Retrieves a specific task based on its ID. Requires JWT authentication.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 61c4c5f4a3b2f8a37e543dcb
 *                 title:
 *                   type: string
 *                   example: Fix server issues
 *                 description:
 *                   type: string
 *                   example: Investigate and resolve reported downtime
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Task not found
 */
router.get("/:id", passport.authenticate("jwt", { session: false }), getTaskById);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     description: Modifies an existing task. Requires JWT authentication.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Task Title
 *               description:
 *                 type: string
 *                 example: Updated description of the task
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Task not found
 */
router.put("/:id", passport.authenticate("jwt", { session: false }), updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: Removes a task from the system. Requires JWT authentication.
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task deleted successfully
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Task not found
 */
router.delete("/:id", passport.authenticate("jwt", { session: false }), deleteTask);

module.exports = router;
