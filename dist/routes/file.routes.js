import { Router } from "express";
import { uploadFile, getFiles, deleteFile } from "../controllers/file.controller";
import { verifyJWT } from "../middleware/authMiddleware";
import multer from "multer";
// ✅ Set up storage (Modify this for AWS S3, Cloudinary, or local storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = Router();
router.post("/", verifyJWT, upload.single("file"), uploadFile); // Upload a file
router.get("/", verifyJWT, getFiles); // Retrieve all files
router.delete("/:id", verifyJWT, deleteFile); // Delete a file by ID
export default router;
