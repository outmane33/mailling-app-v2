const express = require("express");
const {
  getAllSenders,
  getAllSendersCount,
} = require("../services/sendersServices");
const { protect } = require("../services/authService");
const router = express.Router();

router.use(protect);

router.route("/:isp").get(getAllSenders);
router.route("/senders/Count").get(getAllSendersCount);

module.exports = router;
