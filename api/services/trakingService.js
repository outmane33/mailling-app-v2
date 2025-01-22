const expressAsyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Recipiente_RR = require("../models/recipiente_RR_Model");
const Recipiente_Charter = require("../models/recipiente_Charter_Model");
const Test = require("../models/testModel");
const Drop = require("../models/drop_Model");

// Helper function to determine the model based on campaign
const getRecipientModel = async (campaign) => {
  try {
    const drop = await Drop.findOne({ campaignName: campaign });

    if (!drop) {
      return Test;
    }

    // Ensure isp exists and convert to string if it exists
    const ispValue = drop.isp ? drop.isp.toString() : null;

    if (!ispValue) {
      return Test;
    }

    switch (ispValue.toUpperCase()) {
      case "RR":
        return Recipiente_RR;
      case "CHARTER":
        return Recipiente_Charter;
      default:
        return Test;
    }
  } catch (error) {
    return Test;
  }
};

// Helper function to handle email_type updates
const updateEmailType = async (model, email, type, excludeTypes = []) => {
  try {
    if (!model) {
      console.error("Model is null in updateEmailType");
      return;
    }

    const excludeConditions = excludeTypes.map((e) => ({
      email_type: { $ne: e },
    }));

    const updateResult = await model.updateOne(
      {
        email: email,
        $and: excludeConditions,
      },
      { email_type: type }
    );

    return updateResult;
  } catch (error) {
    console.error("Error in updateEmailType:", error);
    throw error; // Re-throw the error to be caught by the caller
  }
};

exports.trackOpen = expressAsyncHandler(async (req, res, next) => {
  try {
    const { email, campaign } = req.query;

    if (!email || !campaign) {
      return next(new ApiError("Missing email or campaign parameters", 400));
    }

    console.log(`Email opened by: ${email}, for campaign: ${campaign}`);

    const recipientModel = await getRecipientModel(campaign);

    if (!recipientModel) {
      console.log("No recipient model returned");
      return next(new ApiError("Invalid campaign specified", 400));
    }

    if (recipientModel.modelName === "Test") {
      const result = await Test.updateOne(
        { campaignName: campaign },
        { $inc: { opens: 1 } },
        { upsert: true }
      );
    } else {
      // Wrap both operations in a try-catch block
      try {
        // Update email type
        await updateEmailType(recipientModel, email, "opener", [
          "leader",
          "clicker",
        ]);

        // Update opens count
        const result = await Drop.updateOne(
          { campaignName: campaign },
          { $inc: { opens: 1 } },
          { upsert: true }
        );
      } catch (error) {
        console.error("Error during update operations:", error);
        return next(new ApiError(`Failed to update: ${error.message}`, 500));
      }
    }

    // Send tracking pixel
    res.setHeader("Content-Type", "image/png");
    res.send(
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/ao8KYkAAAAASUVORK5CYII=",
        "base64"
      )
    );
  } catch (error) {
    console.error("Error in trackOpen:", error);
    return next(new ApiError(`Internal server error: ${error.message}`, 500));
  }
});

exports.trackClick = expressAsyncHandler(async function (req, res, next) {
  const { email, campaign, destination } = req.query;

  if (!email || !campaign || !destination) {
    return next(
      new ApiError("Missing email, campaign, or destination parameters", 400)
    );
  }

  console.log(
    `Click from: ${email}, Campaign: ${campaign}, Redirecting to: ${destination}`
  );

  try {
    const recipientModel = await getRecipientModel(campaign);

    // Use instanceof or compare model names instead of direct comparison
    const isTestModel = recipientModel.modelName === "Test";

    if (isTestModel) {
      const result = await Test.updateOne(
        { campaignName: campaign },
        { $inc: { clicks: 1 } },
        { upsert: true }
      );
    } else {
      try {
        await updateEmailType(recipientModel, email, "clicker", ["leader"]);

        const result = await Drop.updateOne(
          { campaignName: campaign },
          { $inc: { clicks: 1 } },
          { upsert: true }
        );
      } catch (error) {
        console.error(
          `Failed to update email type for ${email}. Error:`,
          error
        );
        return next(new ApiError("Failed to update email type", 500));
      }
    }

    res.redirect(destination);
  } catch (error) {
    console.error(`Error in trackClick: ${error.message}`);
    return next(new ApiError("Internal server error", 500));
  }
});
