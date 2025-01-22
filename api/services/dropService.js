const expressAsyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Drop = require("../models/drop_Model");

//GET
//get drop by CampaignName
exports.getDropByCampaignName = expressAsyncHandler(async (req, res, next) => {
  let { campaignName } = req.params;

  const drop = await Drop.find({ campaignName });
  if (!drop) {
    res.status(200).json({ drop: [] });
  }
  res.status(200).json({ drop });
});

//GET
//get all drops
exports.getAllDrops = expressAsyncHandler(async function (req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const sortField = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";
    const skip = (page - 1) * pageSize;

    // Build filter object
    const filter = {};
    const filterFields = [
      "status",
      "startFrom",
      "total",
      "lastStartIndex",
      "opens",
      "clicks",
      "leads",
      "unsubs",
      "isp",
    ];

    // Handle text search fields with case-insensitive regex
    const textSearchFields = [
      "campaignName",
      "mailer",
      "offer",
      "dataListName",
    ];

    // Add text search filters
    textSearchFields.forEach((field) => {
      if (req.query[field]) {
        filter[field] = { $regex: req.query[field], $options: "i" };
      }
    });

    // Add exact match filters
    filterFields.forEach((field) => {
      if (req.query[field]) {
        // Handle numeric fields
        if (
          [
            "startFrom",
            "total",
            "lastStartIndex",
            "opens",
            "clicks",
            "leads",
            "unsubs",
          ].includes(field)
        ) {
          filter[field] = Number(req.query[field]);
        } else {
          filter[field] = req.query[field];
        }
      }
    });

    // Handle date range if provided
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    // Build sort object
    const sort = {
      [sortField]: sortOrder === "desc" ? -1 : 1,
    };

    // Get total count for pagination
    const totalDrops = await Drop.countDocuments(filter);
    const totalPages = Math.ceil(totalDrops / pageSize);

    // Fetch drops with pagination and sorting
    const drops = await Drop.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .select("-html -text"); // Exclude large fields for better performance

    // Calculate statistics
    const stats = {
      totalDrops,
      activeDrops: await Drop.countDocuments({ ...filter, status: "active" }),
      totalOpens: await Drop.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: "$opens" } } },
      ]).then((result) => result[0]?.total || 0),
      totalClicks: await Drop.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: "$clicks" } } },
      ]).then((result) => result[0]?.total || 0),
    };

    res.status(200).json({
      success: true,
      data: {
        drops,
        pagination: {
          currentPage: page,
          pageSize,
          totalPages,
          totalItems: totalDrops,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        stats,
        filter,
        sort: {
          field: sortField,
          order: sortOrder,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching drops",
      error: error.message,
    });
  }
});

// Helper function to get date range
const getDateRange = (period = "day") => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  if (period === "month") {
    start.setDate(1);
  }

  const end = new Date(start);
  if (period === "day") {
    end.setDate(end.getDate() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }

  return { start, end };
};

// Unified stats function that handles different metrics and time periods
exports.getStats = expressAsyncHandler(async function (req, res) {
  try {
    const { metric = "all", period = "day" } = req.query;
    const { start, end } = getDateRange(period);

    // Define the aggregation pipelines for different metrics
    const matchStage = {
      $match: {
        createdAt: { $gte: start, $lt: end },
      },
    };

    let pipeline = [matchStage];

    // If we're only getting a count, we can optimize by using countDocuments
    if (metric === "count") {
      const count = await Drop.countDocuments(matchStage.$match);
      return res.status(200).json({ count });
    }

    // For other metrics, we'll use aggregation
    const groupStage = {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalClicks: { $sum: "$clicks" },
        totalLastStartIndex: { $sum: "$lastStartIndex" },
      },
    };

    pipeline.push(groupStage);

    const result = await Drop.aggregate(pipeline);

    // Prepare response based on the requested metric
    const stats =
      result.length > 0
        ? result[0]
        : {
            count: 0,
            totalClicks: 0,
            totalLastStartIndex: 0,
          };

    // Remove the _id field from the response
    delete stats._id;

    // Add period information for monthly stats
    if (period === "month") {
      stats.month = start.toLocaleString("default", { month: "long" });
      stats.year = start.getFullYear();
    }

    // Filter response based on requested metric
    if (metric !== "all") {
      const metricMap = {
        clicks: "totalClicks",
        lastStartIndex: "totalLastStartIndex",
        count: "count",
      };
      const specificStat = { [metricMap[metric]]: stats[metricMap[metric]] };
      return res.status(200).json(specificStat);
    }

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching statistics",
      error: error.message,
    });
  }
});
