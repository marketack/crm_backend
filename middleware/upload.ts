import multer from "multer";
import path from "path";

// ✅ Configure storage settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // ✅ Store in `uploads/` folder (Make sure this folder exists)
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // ✅ Rename file with timestamp
  },
});

// ✅ File Filter: Accept only images
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

// ✅ Configure Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // ✅ Limit file size to 5MB
  fileFilter: fileFilter,
});

export default upload;
