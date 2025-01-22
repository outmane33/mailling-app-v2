const expressAsyncHandler = require("express-async-handler");

const path = require("path");
const fs = require("fs");
const Image = require("../models/imageModel");

exports.getAllImages = expressAsyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [images, total, stats] = await Promise.all([
      Image.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("uploadedBy"),
      Image.countDocuments(),
      Image.aggregate([
        {
          $group: {
            _id: null,
            totalSize: { $sum: "$size" },
            avgSize: { $avg: "$size" },
          },
        },
      ]),
    ]);

    res.json({
      images,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
      },
      stats: {
        totalImages: total,
        totalSize: stats[0]?.totalSize || 0,
        averageSize: Math.round(stats[0]?.avgSize || 0),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

exports.uploadNewImage = expressAsyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Move file to uploads directory
    const oldPath = req.file.path;
    const newPath = path.join(uploadsDir, req.file.filename);

    if (oldPath !== newPath) {
      fs.renameSync(oldPath, newPath);
    }

    const image = new Image({
      fileName: req.file.filename,
      size: req.file.size,
      uploadedBy: req.user?._id,
    });

    await image.save();
    await image.populate("uploadedBy");
    res.status(201).json({
      ...image.toObject(),
      url: `${process.env.BACKEND_URL}/uploads/${req.file.filename}`,
    });
  } catch (error) {
    // Clean up file if there's an error
    if (req.file) {
      const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(500).json({ message: error.message });
  }
});

exports.deleteImage = expressAsyncHandler(async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Delete file from filesystem
    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      image.fileName.split("/").pop()
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Image.deleteOne({ _id: req.params.id });
    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
