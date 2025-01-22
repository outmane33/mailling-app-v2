const express = require("express");
const {
  getAllImages,
  uploadNewImage,
  deleteImage,
} = require("../services/imageService");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect } = require("../services/authService");
const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "..", "uploads");
    // Create the uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error(
        "Invalid file type. Only JPG, PNG, and GIF are allowed"
      );
      return cb(error, false);
    }
    cb(null, true);
  },
});

router.use(protect);

router.get("/", getAllImages);
router.post("/upload", upload.single("image"), uploadNewImage);
router.delete("/:id", deleteImage);

module.exports = router;
