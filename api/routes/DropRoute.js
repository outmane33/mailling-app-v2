const express = require("express");
const {
  getDropByCampaignName,
  getAllDrops,
  getStats,
} = require("../services/dropService");
const { protect } = require("../services/authService");
const router = express.Router();

router.use(protect);

// General drop routes
router.route("/").get(getAllDrops);

// Campaign specific route
router.route("/:campaignName").get(getDropByCampaignName);

// get stats for today
router.route("/stats/daily").get((req, res) => {
  req.query.period = "day";
  getStats(req, res);
});

// get stats for this month
router.route("/stats/monthly").get((req, res) => {
  req.query.period = "month";
  getStats(req, res);
});

module.exports = router;
