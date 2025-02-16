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

router.post("/", passport.authenticate("jwt", { session: false }), createTask);
router.get("/", passport.authenticate("jwt", { session: false }), getAllTasks);
router.get("/:id", passport.authenticate("jwt", { session: false }), getTaskById);
router.put("/:id", passport.authenticate("jwt", { session: false }), updateTask);
router.delete("/:id", passport.authenticate("jwt", { session: false }), deleteTask);

module.exports = router;
