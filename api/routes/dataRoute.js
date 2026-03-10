const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  getDataByISP,
  uploadYahooEmails,
  getData,
} = require("../services/dataService");
const { protect } = require("../services/authService");

const router = express.Router();

router.use(protect);

router.route("/").post(getDataByISP);
router.post("/upload", upload.single("file"), uploadYahooEmails);
router.get("/getData", getData);

module.exports = router;
