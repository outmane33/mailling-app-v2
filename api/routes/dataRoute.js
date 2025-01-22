const express = require("express");
const { getDataByISP } = require("../services/dataService");
const { protect } = require("../services/authService");

const router = express.Router();

router.use(protect);

router.route("/").post(getDataByISP);

module.exports = router;
