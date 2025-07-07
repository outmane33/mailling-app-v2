const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../../config.env") });

const dbConnection = function () {
  console.log(__dirname);
  mongoose.connect(process.env.CONNECTION_STRING).then(function (result) {
    console.log(`database connected successfully: ${result.connection.host}`);
  });
};
module.exports = { dbConnection };
