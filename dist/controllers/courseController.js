var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose, { Types } from "mongoose";
import Course from "../models/course.model";
import User from "../models/user.model";
import Notification from "../models/notification.model";
/**
 * 🔍 Get All Courses (Public & Admin)
 */
export const getCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) ? new Types.ObjectId(req.user.userId) : null;
        const user = userId ? yield User.findById(userId).populate("roles", "name") : null;
        let query = { status: "approved" };
        if (user && user.roles.some((role) => role.name === "admin")) {
            query = { status: { $in: ["approved", "pending", "rejected"] } };
        }
        const courses = yield Course.find(query).populate("createdBy", "name email");
        // ✅ Fix: Ensure returning `void`
        res.status(200).json({ message: "Courses retrieved successfully", courses });
        return;
    }
    catch (error) {
        console.error("Error retrieving courses:", error);
        res.status(500).json({ message: "Server error", error });
        return;
    }
});
/**
 * 🆕 Create a Course (User or Admin)
 */
export const createCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { title, description, price } = req.body;
        const userId = new Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        if (!title || !description || price == null) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const isAdmin = (_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes("admin");
        const status = isAdmin ? "approved" : "pending";
        const newCourse = yield Course.create({
            title,
            description,
            price,
            createdBy: userId,
            status,
        });
        if (!isAdmin) {
            yield Notification.create({
                user: null,
                message: `A new course "${title}" requires approval.`,
                type: "course_review",
            });
        }
        res.status(201).json({ message: "Course created", course: newCourse });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
        return;
    }
});
/**
 * ✅ Approve or Reject Course (Admin Only)
 */
export const reviewCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { courseId } = req.params;
        const { status } = req.body;
        const userId = new Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        if (!["approved", "rejected"].includes(status)) {
            res.status(400).json({ message: "Invalid status" });
            return;
        }
        const course = yield Course.findById(courseId);
        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        course.status = status;
        course.reviewedBy = userId;
        yield course.save();
        // ✅ Notify creator
        yield Notification.create({
            user: course.createdBy,
            message: `Your course "${course.title}" has been ${status}.`,
            type: "course_review",
        });
        res.status(200).json({ message: `Course ${status}`, course });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
        return;
    }
});
/**
 * 🎓 Enroll in a Course
 */
export const enrollCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { courseId } = req.body;
        const userId = new Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        // ✅ Validate `courseId`
        if (!Types.ObjectId.isValid(courseId)) {
            res.status(400).json({ message: "Invalid course ID" });
            return;
        }
        const user = yield User.findById(userId);
        const course = yield Course.findById(courseId);
        // ✅ Ensure course exists and is approved
        if (!user || !course || course.status !== "approved") {
            res.status(404).json({ message: "Course not found or not approved" });
            return;
        }
        // ✅ Check if the user is already enrolled
        const isAlreadyEnrolled = course.enrolledUsers.some((enrolledUser) => enrolledUser.toString() === userId.toString());
        if (isAlreadyEnrolled) {
            res.status(409).json({ message: "You are already enrolled in this course" });
            return;
        }
        // ✅ Add user to enrolled list
        course.enrolledUsers.push(userId);
        yield course.save();
        // ✅ Notify user when enrolled
        yield Notification.create({
            user: userId,
            message: `You have enrolled in "${course.title}".`,
            type: "course_enrollment",
        });
        res.status(200).json({ message: `Successfully enrolled in "${course.title}"` });
    }
    catch (error) {
        console.error("Error enrolling in course:", error);
        res.status(500).json({ message: "Server error", error });
    }
});
/**
 * 📚 Add Lesson to Course (Only Course Creator/Admin)
 */
export const addLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { courseId } = req.params;
        const { title, content, videoUrl, duration } = req.body;
        const userId = new Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        if (!title || !content) {
            res.status(400).json({ message: "Title and content are required for a lesson." });
            return;
        }
        const course = yield Course.findById(courseId);
        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        if (course.createdBy.toString() !== userId.toString() && !((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes("admin"))) {
            res.status(403).json({ message: "Unauthorized to add lessons" });
            return;
        }
        // ✅ Fix: Ensure title, content, and video URL exist
        const newLesson = { title, content, videoUrl, duration };
        course.lessons.push(newLesson);
        yield course.save();
        // ✅ Notify enrolled users about the new lesson
        yield Notification.create({
            user: { $in: course.enrolledUsers }, // Send to all enrolled users
            message: `A new lesson "${title}" has been added to "${course.title}".`,
            type: "lesson_added",
        });
        res.status(201).json({ message: "Lesson added successfully", course });
        return;
    }
    catch (error) {
        console.error("Error adding lesson:", error);
        res.status(500).json({ message: "Server error", error });
        return;
    }
});
/**
 * 🔄 Check Enrollment Status
 */
export const checkEnrollment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { courseId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!mongoose.isValidObjectId(courseId)) {
            res.status(400).json({ message: "Invalid course ID" });
            return;
        }
        const user = yield User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const isEnrolled = user.enrolledCourses.some((enrolledCourse) => enrolledCourse.toString() === courseId);
        res.status(200).json({ enrolled: isEnrolled });
    }
    catch (error) {
        console.error("Error checking enrollment status:", error);
        res.status(500).json({ message: "Server error", error });
    }
});
/**
 * ✏️ Update Course (Admins & Course Creator Only)
 */
export const updateCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { courseId } = req.params;
        const { title, description, price } = req.body;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) ? new Types.ObjectId(req.user.userId) : null;
        if (!Types.ObjectId.isValid(courseId)) {
            res.status(400).json({ message: "Invalid course ID" });
            return;
        }
        const course = yield Course.findById(courseId);
        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        if (!userId || (course.createdBy.toString() !== userId.toString() && !((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes("admin")))) {
            res.status(403).json({ message: "Unauthorized to update this course" });
            return;
        }
        course.title = title || course.title;
        course.description = description || course.description;
        course.price = price !== undefined ? price : course.price;
        yield course.save();
        res.status(200).json({ message: "Course updated successfully", course });
    }
    catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ message: "Server error", error });
    }
});
/**
 * ❌ Delete Course (Admins & Course Creator Only)
 */
export const deleteCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { courseId } = req.params;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) ? new Types.ObjectId(req.user.userId) : null;
        if (!Types.ObjectId.isValid(courseId)) {
            res.status(400).json({ message: "Invalid course ID" });
            return;
        }
        const course = yield Course.findById(courseId);
        if (!course) {
            res.status(404).json({ message: "Course not found" });
            return;
        }
        if (!userId || (course.createdBy.toString() !== userId.toString() && !((_b = req.user) === null || _b === void 0 ? void 0 : _b.roles.includes("admin")))) {
            res.status(403).json({ message: "Unauthorized to delete this course" });
            return;
        }
        yield Course.findByIdAndDelete(courseId);
        res.status(200).json({ message: "Course deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ message: "Server error", error });
    }
});
