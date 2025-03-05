const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Function to determine the correct upload directory
const getUploadPath = (req) => {
  if (req.baseUrl.includes("/posts")) return "uploads/cmsPost/";

  return "uploads/others/"; // Default fallback
};

// Multer storage configuration (Dynamic Destination)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = getUploadPath(req);

    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});

// File filter (Allow both images and videos)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and videos are allowed."), false);
  }
};

// Max file size (optional - adjust as needed)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

module.exports = upload;