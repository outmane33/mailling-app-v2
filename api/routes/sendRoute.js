const express = require("express");
const {
  sendTest,
  sendDrop,
  pauseCampaign,
  resumeCampaign,
  stopCampaign,
  readErrorLog,
} = require("../services/SendService");
const { protect } = require("../services/authService");
const router = express.Router();

router.use(protect);
router.route("/test").post(sendTest);
router.route("/drop").post(sendDrop);
router.route("/pauseCampaign").post(pauseCampaign);
router.route("/resumeCampaign").post(resumeCampaign);
router.route("/stopCampaign").post(stopCampaign);
router.route("/errorLog").get(readErrorLog);

module.exports = router;
