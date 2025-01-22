const express = require("express");
const { getAllTests, getCountTestToday } = require("../services/testService");
const { protect } = require("../services/authService");

const router = express.Router();

router.use(protect);

router.get("/", getAllTests);
router.get("/count/today", getCountTestToday);

module.exports = router;
