import { Request, Response } from "express";
import { File } from "../models/file.model";
import multer from "multer";
import path from "path";
import fs from "fs";
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    company?: string | null;
  };
}
// ✅ Configure Multer for File Uploads (Modify for AWS S3/Cloudinary)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage }).single("file");

/** ✅ Upload File */
export const uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const file = new File({
      user: req.user?.userId,
      filename: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      size: req.file.size,
    });

    await file.save();
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ message: "Error uploading file", error });
  }
};

/** ✅ Get All Files */
export const getFiles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const files = await File.find().populate("user", "name email");
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: "Error fetching files", error });
  }
};

/** ✅ Delete a File */
export const deleteFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    // ✅ Ensure only Admins or Owners can delete files
    if (file.user.toString() !== req.user?.userId && !req.user?.roles.includes("admin")) {
      res.status(403).json({ message: "Unauthorized: You can only delete your own files" });
      return;
    }

    // ✅ Remove File from Storage
    const filePath = path.join(__dirname, "..", file.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await file.deleteOne();
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting file", error });
  }
};
