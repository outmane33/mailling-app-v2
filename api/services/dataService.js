const expressAsyncHandler = require("express-async-handler");
const fs = require("fs");
const csv = require("csv-parser");

const ApiError = require("../utils/apiError");
const Recipiente_Charter = require("../models/recipiente_Charter_Model");
const Recipiente_RR = require("../models/recipiente_RR_Model");
const Recipiente_Gmail = require("../models/recipiente_Gmail_Model");
const Recipiente_Yahoo = require("../models/recipiente_Yahoo_Model");

// Add all your models in this object
let models = {
  Recipiente_Charter_1: Recipiente_Charter,
  Recipiente_RR_1: Recipiente_RR,
  Recipiente_Gmail_1: Recipiente_Gmail,
  Recipiente_Yahoo_1: Recipiente_Yahoo,
};

// Get data by ISP & COUNTRY
exports.getDataByISP = expressAsyncHandler(async function (req, res, next) {
  const { isp, country, email_type } = req.body;
  let result = []; // Array to hold the results

  if (isp) {
    // Loop through all the models
    for (const [modelName, model] of Object.entries(models)) {
      // Check if the model name includes the given ISP keyword (e.g., Charter, RR, Gmail)
      if (modelName.toLowerCase().includes(isp.toLowerCase())) {
        const queryCriteria = {}; // Dynamic query object

        if (country) {
          queryCriteria.country = country; // Add country to the query if provided
        }

        if (email_type && email_type.length > 0) {
          queryCriteria.email_type = { $in: email_type }; // Add email_type to the query if provided
        }

        // Get the count of matching records
        const recordCount = await model.find(queryCriteria).countDocuments();
        result.push([modelName, recordCount]); // Add to the result array
      }
    }

    if (result.length > 0) {
      res.json(result); // Return the result array if there are matches
    } else {
      return next(
        new ApiError(`No matching models found for the given ISP: ${isp}`)
      );
    }
  } else {
    return next(new ApiError("ISP not provided"));
  }
});

exports.uploadYahooEmails = expressAsyncHandler(async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { file } = req;
    const { data_provider, country, email_type } = req.body;

    // Validate required fields in the request body
    if (!data_provider || !country || !email_type) {
      return res.status(400).json({
        error: "data_provider, country, and email_type are required",
      });
    }

    // Validate country and email type against allowed values
    const allowedCountries = [
      "United States",
      "Canada",
      "United Kingdom",
      "France",
      "Germany",
      "Australia",
      "India",
      "China",
      "Japan",
      "Brazil",
    ];

    const allowedEmailTypes = ["fresh", "clean", "opener", "clicker", "leader"];

    if (!allowedCountries.includes(country)) {
      return res.status(400).json({ error: "Invalid country" });
    }

    if (!allowedEmailTypes.includes(email_type)) {
      return res.status(400).json({ error: "Invalid email type" });
    }

    const yahooEmails = [];

    // Read the uploaded CSV file
    fs.createReadStream(file.path)
      .pipe(csv())
      .on("data", (row) => {
        if (row["Yahoo Emails"] && row["Yahoo Emails"].includes("@yahoo.com")) {
          yahooEmails.push({
            email: row["Yahoo Emails"].trim(),
            data_provider,
            country,
            email_type,
          });
        }
      })
      .on("end", async () => {
        try {
          // Save emails to the database
          await Recipiente_Yahoo.insertMany(yahooEmails, { ordered: false });

          // Delete the file after processing
          fs.unlinkSync(file.path);

          res.status(201).json({
            message: "Yahoo emails successfully uploaded",
            count: yahooEmails.length,
          });
        } catch (dbError) {
          res.status(500).json({
            error: "Error saving to database",
            details: dbError.message,
          });
        }
      })
      .on("error", (err) => {
        res.status(500).json({
          error: "Error processing the file",
          details: err.message,
        });
      });
  } catch (error) {
    res.status(500).json({
      error: "An unexpected error occurred",
      details: error.message,
    });
  }
});

exports.getData = expressAsyncHandler(async function (req, res, next) {
  const emails = await Recipiente_RR.find({}, { _id: false, email: true });
  res.json(emails);
});
