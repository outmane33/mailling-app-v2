const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    campaignName: {
      type: String,
      required: true,
    },
    mailer: {
      type: String,
      required: true,
    },
    isp: {
      type: String,
      required: true,
    },
    offer: {
      type: String,
      required: true,
    },
    affiliate_network: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    opens: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Test = mongoose.model("Test", testSchema);

module.exports = Test;
