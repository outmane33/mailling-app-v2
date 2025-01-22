const expressAsyncHandler = require("express-async-handler");
const Drop = require("../models/drop_Model");
const Test = require("../models/testModel");
const User = require("../models/userModel");

exports.getStatistics = expressAsyncHandler(async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setHours(0, 0, 0, 0);

    // Get active drops count
    const activeDrops = await Drop.countDocuments({ status: "active" });

    // Get daily drops count
    const dailyDrops = await Drop.countDocuments({
      createdAt: { $gte: today },
    });

    // Get daily sent count
    const dailySentAggregation = await Drop.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          totalSent: { $sum: "$total" },
        },
      },
    ]);
    const dailySent = dailySentAggregation[0]?.totalSent || 0;

    // Get daily clicks
    const dailyClicks = await Drop.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: "$clicks" },
        },
      },
    ]);

    // Get daily tests
    const dailyTests = await Test.countDocuments({
      createdAt: { $gte: today },
    });

    // Get daily delivered
    const dailyDelivered = await Drop.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          totalDelivered: { $sum: "$total" },
        },
      },
    ]);

    // Get monthly clicks
    const monthlyClicks = await Drop.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: "$clicks" },
        },
      },
    ]);

    // Get users count
    const usersCount = await User.countDocuments();

    // Get daily opens vs clicks data for chart
    const dailyStats = await Drop.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          opens: { $sum: "$opens" },
          clicks: { $sum: "$clicks" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const statistics = {
      activeDrops,
      dailyDrops,
      dailySent,
      dailyClicks: dailyClicks[0]?.totalClicks || 0,
      dailyTests,
      dailyDelivered: dailyDelivered[0]?.totalDelivered || 0,
      monthlyClicks: monthlyClicks[0]?.totalClicks || 0,
      usersCount,
      dailyStats: dailyStats.map((stat) => ({
        week: stat._id,
        open: stat.opens,
        click: stat.clicks,
      })),
    };

    res.status(200).json(statistics);
  } catch (error) {
    console.error("Statistics Error:", error);
    res.status(500).json({ message: "Error fetching statistics" });
  }
});
