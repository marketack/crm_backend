const Task = require("../models/Task");
const asyncHandler = require("express-async-handler");

// Create a new task
exports.createTask = asyncHandler(async (req, res) => {
  const { title, description, status, assignedTo } = req.body;

  try {
    const newTask = await Task.create({
      title,
      description,
      status,
      assignedTo: assignedTo || null, // ✅ Ensure assignedTo is saved
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
});

// Update Task
exports.updateTask = asyncHandler(async (req, res) => {
  const { title, description, status, assignedTo } = req.body;
  
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.title = title;
    task.description = description;
    task.status = status;
    task.assignedTo = assignedTo || task.assignedTo; // ✅ Update assignedTo

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
});

// controllers/taskController.js
exports.getAllTasks = asyncHandler(async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo", "name email");
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
});


// Get task by ID
exports.getTaskById = asyncHandler(async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("assignedTo", "username email");
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error fetching task", error: error.message });
  }
});




// Delete a task
exports.deleteTask = asyncHandler(async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();
    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
});
