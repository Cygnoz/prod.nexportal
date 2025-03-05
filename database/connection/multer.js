const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Function to get the correct upload directory
const getUploadPath = (req) => {
  if (req.baseUrl.includes("/posts")) return "uploads/";

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

// File filter (only images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images are allowed."), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;