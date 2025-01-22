const express = require("express");
const { getStatistics } = require("../services/statisticsService");
const { protect } = require("../services/authService");

const router = express.Router();

router.use(protect);

router.route("/").get(getStatistics);

module.exports = router;
