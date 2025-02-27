import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import Course from "../models/course.model";
import User from "../models/user.model";

/**
 * 🔍 Get All Courses (Public)
 */
export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await Course.find().populate("createdBy", "name email");
    res.status(200).json({ message: "Courses retrieved successfully", courses });
  } catch (error) {
    console.error("Error retrieving courses:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 🆕 Create a New Course (Authenticated Users)
 */
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, price } = req.body;

    if (!title || !description || price == null) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const newCourse = await Course.create({
      title,
      description,
      price,
      createdBy: new mongoose.Types.ObjectId(req.user?.userId),
    });

    res.status(201).json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 🎓 Enroll in a Course (Authenticated Users)
 */
export const enrollCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.body;
    const userId = req.user?.userId; // Keep userId as a string

    if (!mongoose.isValidObjectId(courseId)) {
      res.status(400).json({ message: "Invalid course ID" });
      return;
    }

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      res.status(404).json({ message: "User or course not found" });
      return;
    }

    const courseObjectId = new mongoose.Types.ObjectId(courseId);

    if (!user.enrolledCourses.some((c) => c.toString() === courseObjectId.toString())) {
      user.enrolledCourses.push(courseObjectId as mongoose.Types.ObjectId);
      await user.save();
    }

    res.status(200).json({ message: "Successfully enrolled in the course" });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


/**
 * ✏️ Update Course (Admins & Course Creator Only)
 */
export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { title, description, price } = req.body;
    const userId = req.user?.userId;

    if (!mongoose.isValidObjectId(courseId)) {
      res.status(400).json({ message: "Invalid course ID" });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    // Only allow the course creator or an admin to update
    if (course.createdBy.toString() !== userId && !req.user?.roles.includes("admin")) {
      res.status(403).json({ message: "Unauthorized to update this course" });
      return;
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.price = price !== undefined ? price : course.price;

    await course.save();
    res.status(200).json({ message: "Course updated successfully", course });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * ❌ Delete Course (Admins & Course Creator Only)
 */
export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.userId;

    if (!mongoose.isValidObjectId(courseId)) {
      res.status(400).json({ message: "Invalid course ID" });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    // Only allow the course creator or an admin to delete
    if (course.createdBy.toString() !== userId && !req.user?.roles.includes("admin")) {
      res.status(403).json({ message: "Unauthorized to delete this course" });
      return;
    }

    await Course.findByIdAndDelete(courseId);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 🔄 Check Enrollment Status
 */
export const checkEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.userId;

    if (!mongoose.isValidObjectId(courseId)) {
      res.status(400).json({ message: "Invalid course ID" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isEnrolled = user.enrolledCourses.some(
      (enrolledCourse) => enrolledCourse.toString() === courseId
    );

    res.status(200).json({ enrolled: isEnrolled });
  } catch (error) {
    console.error("Error checking enrollment status:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
