import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import Course from "../models/course.model";
import User from "../models/user.model";
import Notification from "../models/notification.model";

/**
 * 🔍 Get All Courses (Public & Admin)
 */
export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId ? new Types.ObjectId(req.user.userId) : null;
    const user = userId ? await User.findById(userId).populate("roles", "name") : null;

    let query: any = { status: "approved" };
    if (user && user.roles.some((role: any) => role.name === "admin")) {
      query = { status: { $in: ["approved", "pending", "rejected"] } };
    }

    const courses = await Course.find(query).populate("createdBy", "name email");

    // ✅ Fix: Ensure returning `void`
    res.status(200).json({ message: "Courses retrieved successfully", courses });
    return;
  } catch (error) {
    console.error("Error retrieving courses:", error);
    res.status(500).json({ message: "Server error", error });
    return;
  }
};

/**
 * 🆕 Create a Course (User or Admin)
 */
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, price } = req.body;
    const userId = new Types.ObjectId(req.user?.userId);

    if (!title || !description || price == null) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const isAdmin = req.user?.roles.includes("admin");
    const status = isAdmin ? "approved" : "pending";

    const newCourse = await Course.create({
      title,
      description,
      price,
      createdBy: userId,
      status,
    });

    if (!isAdmin) {
      await Notification.create({
        user: null,
        message: `A new course "${title}" requires approval.`,
        type: "course_review",
      });
    }

    res.status(201).json({ message: "Course created", course: newCourse });
    return;
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    return;
  }
};



/**
 * ✅ Approve or Reject Course (Admin Only)
 */
export const reviewCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { status } = req.body;
    const userId = new Types.ObjectId(req.user?.userId);

    if (!["approved", "rejected"].includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    course.status = status;
    course.reviewedBy = userId;
    await course.save();

    // ✅ Notify creator
    await Notification.create({
      user: course.createdBy,
      message: `Your course "${course.title}" has been ${status}.`,
      type: "course_review",
    });

    res.status(200).json({ message: `Course ${status}`, course });
    return;
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    return;
  }
};

/**
 * 🎓 Enroll in a Course
 */
export const enrollCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.body;
    const userId = new Types.ObjectId(req.user?.userId);

    // ✅ Validate `courseId`
    if (!Types.ObjectId.isValid(courseId)) {
      res.status(400).json({ message: "Invalid course ID" });
      return;
    }

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    // ✅ Ensure course exists and is approved
    if (!user || !course || course.status !== "approved") {
      res.status(404).json({ message: "Course not found or not approved" });
      return;
    }

    // ✅ Check if the user is already enrolled
    const isAlreadyEnrolled = course.enrolledUsers.some(
      (enrolledUser) => enrolledUser.toString() === userId.toString()
    );

    if (isAlreadyEnrolled) {
      res.status(409).json({ message: "You are already enrolled in this course" });
      return;
    }

    // ✅ Add user to enrolled list
    course.enrolledUsers.push(userId);
    await course.save();

    // ✅ Notify user when enrolled
    await Notification.create({
      user: userId,
      message: `You have enrolled in "${course.title}".`,
      type: "course_enrollment",
    });

    res.status(200).json({ message: `Successfully enrolled in "${course.title}"` });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * 📚 Add Lesson to Course (Only Course Creator/Admin)
 */
export const addLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { title, content, videoUrl, duration } = req.body;
    const userId = new Types.ObjectId(req.user?.userId);

    if (!title || !content) {
      res.status(400).json({ message: "Title and content are required for a lesson." });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    if (course.createdBy.toString() !== userId.toString() && !req.user?.roles.includes("admin")) {
      res.status(403).json({ message: "Unauthorized to add lessons" });
      return;
    }

    // ✅ Fix: Ensure title, content, and video URL exist
    const newLesson = { title, content, videoUrl, duration };

    course.lessons.push(newLesson);
    await course.save();

    // ✅ Notify enrolled users about the new lesson
    await Notification.create({
      user: { $in: course.enrolledUsers }, // Send to all enrolled users
      message: `A new lesson "${title}" has been added to "${course.title}".`,
      type: "lesson_added",
    });

    res.status(201).json({ message: "Lesson added successfully", course });
    return;
  } catch (error) {
    console.error("Error adding lesson:", error);
    res.status(500).json({ message: "Server error", error });
    return;
  }
};


/**
 * 🔄 Check Enrollment Status
 */
export const checkEnrollment = async (req: Request, res: Response) => {
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


/**
 * ✏️ Update Course (Admins & Course Creator Only)
 */
export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { title, description, price } = req.body;
    const userId = req.user?.userId ? new Types.ObjectId(req.user.userId) : null;

    if (!Types.ObjectId.isValid(courseId)) {
      res.status(400).json({ message: "Invalid course ID" });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    if (!userId || (course.createdBy.toString() !== userId.toString() && !req.user?.roles.includes("admin"))) {
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
    const userId = req.user?.userId ? new Types.ObjectId(req.user.userId) : null;

    if (!Types.ObjectId.isValid(courseId)) {
      res.status(400).json({ message: "Invalid course ID" });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    if (!userId || (course.createdBy.toString() !== userId.toString() && !req.user?.roles.includes("admin"))) {
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



