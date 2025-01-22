const expressAsyncHandler = require("express-async-handler");
const Test = require("../models/testModel");

exports.getAllTests = expressAsyncHandler(async (req, res) => {
  try {
    // Extract query parameters with defaults
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;

    // Build filter query object
    const filterFields = [
      "campaignName",
      "isp",
      "mailer",
      "offer",
      "affiliate_network",
    ];

    const filter = {};
    const searchTerm = req.query.search?.trim();

    if (searchTerm) {
      // Global search across multiple fields
      filter.$or = filterFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      }));
    } else {
      // Individual field filters
      filterFields.forEach((field) => {
        if (req.query[field]) {
          filter[field] = { $regex: req.query[field], $options: "i" };
        }
      });
    }

    // Numeric filters
    ["opens", "clicks", "total"].forEach((field) => {
      if (req.query[field]) {
        filter[field] = parseInt(req.query[field]);
      }
    });

    // Date range filter
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    // Build sort object
    const sort = { [sortField]: sortOrder };

    // Execute queries
    const [tests, totalTests] = await Promise.all([
      Test.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Test.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalTests / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Return response
    res.status(200).json({
      success: true,
      data: tests,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalTests,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tests",
      error: error.message,
    });
  }
});

exports.getCountTestToday = expressAsyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await Test.countDocuments({
    createdAt: {
      $gte: today,
      $lt: tomorrow,
    },
  });

  res.status(200).json({ count });
});
