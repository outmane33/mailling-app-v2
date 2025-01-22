const expressAsyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const path = require("path");

const { getReceiverSocketId, io } = require("../utils/socket.js");
const { replaceRandomInObject } = require("../utils/randoms");
const { replacePlaceholders } = require("../utils/replacePlaceholders");
const Recipiente_Charter = require("../models/recipiente_Charter_Model");
const Recipiente_RR = require("../models/recipiente_RR_Model");
const SenderGmail = require("../models/sender_Gmail_Model");
const ApiError = require("../utils/apiError");
const Test = require("../models/testModel");
const Drop = require("../models/drop_Model");

let email_error_name = "email_error";

//SEND DROP
exports.sendDrop = expressAsyncHandler(async function (req, res, next) {
  const { username } = req.user;
  email_error_name = username;
  clearErrorLog();
  try {
    let {
      login, //use before send
      placeholders,
      country, //filter data
      email_type, //filter data
      count, //filter data
      duplicate, //filter data
      campaignName, // name of drop
      isp, //filter data
      startFrom, //filter data
      service,
      testEmail, // the email to send test messages
      afterTest, // send test message after this number of emails
      ...emailData
    } = req.body;

    // Replace placeholders and random values in the email data
    replacePlaceholders(emailData, placeholders);
    replaceRandomInObject(emailData);

    // Dynamically select the model based on the `isp` value in req.body
    const models = [Recipiente_Charter, Recipiente_RR];
    const selectedModel = models.find((model) => model.modelName.includes(isp));

    if (!selectedModel) {
      return next(new ApiError(`No model found for ISP: ${isp}`, 400));
    }
    // Build query object to filter by country and email_type
    const query = {};
    if (country) query.country = country;
    if (email_type && email_type.length > 0)
      query.email_type = { $in: email_type };

    // Fetch or create the drop record for this campaign
    let drop = await Drop.findOne({ campaignName }).exec();
    if (!drop) {
      drop = new Drop({
        campaignName,
        lastStartIndex: startFrom,
        lastLoginIndex: 0,
        status: "active",
        login,
        placeholders,
        country,
        email_type,
        count,
        duplicate,
        startFrom,
        isp,
        total: count,
        service,
        testEmail, // saving testEmail
        afterTest, // saving afterTest
        ...emailData,
      });
      await drop.save();
    } else {
      // Update the count based on the drop progress
      count = drop.total - drop.lastStartIndex;
      drop.count = count;
      await drop.save();
    }

    let { lastStartIndex, lastLoginIndex } = drop;
    const startIndex = lastStartIndex;

    // Use the `limit` and `skip` functions to implement pagination
    const selectedRecipients = await selectedModel
      .find(query, "email id")
      .skip(startIndex)
      .limit(count)
      .exec();

    if (!selectedRecipients.length) {
      return next(
        new ApiError(`No recipients found matching the criteria.`, 404)
      );
    }

    let loginIndex = lastLoginIndex; // Start with the last used login index
    let emailSentCount = 0; // Track how many emails have been sent

    // Define a flag to exit the loop based on the campaign status
    let shouldPauseOrStop = false;

    // Loop through the selected recipients and send emails
    for (let i = 0; i < selectedRecipients.length; i++) {
      // Check the campaign status at the start of each loop
      drop = await Drop.findOne({ campaignName }).exec();
      if (drop.status === "paused") {
        shouldPauseOrStop = true;
        break; // Exit the loop if the campaign is paused
      }
      if (drop.status === "stopped") {
        return res.json({
          message: `Campaign ${campaignName} has been stopped.`,
        });
      }

      for (let j = 0; j < duplicate; j++) {
        // Send duplicate emails if needed
        const account = login[loginIndex];
        const emailDetails = {
          ...emailData,
          sender_email: account.email,
          sender_email_password: account.app_password,
          to: selectedRecipients[i].email, // Recipient email
          service,
        };

        //realtime functionality
        const receiverSocketId = getReceiverSocketId(req.user._id.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("emailSent", {
            campaignName,
            emailSentCount: emailSentCount + 1,
            total: count,
          });
        }

        // Simulate email sending (replace with actual send logic)
        await sendEmail(emailDetails);

        // Track number of sent emails and check if it's time to send to testEmail
        emailSentCount++;
        if (emailSentCount % afterTest === 0) {
          const testEmailDetails = {
            ...emailData,
            sender_email: account.email,
            sender_email_password: account.app_password,
            to: testEmail, // Test email recipient
            service,
          };

          // Send test email after every "afterTest" emails
          await sendEmail(testEmailDetails);
          console.log(
            `Test email sent to ${testEmail} after ${emailSentCount} emails.`
          );
        }

        // Move to the next login account
        loginIndex++;
        if (loginIndex >= login.length) {
          loginIndex = 0;
        }
      }

      // After each email is sent, save Drop progress in the database
      await Drop.updateOne(
        { campaignName },
        { lastStartIndex: startIndex + i + 1, lastLoginIndex: loginIndex }
      );
    }

    // If the loop is exited due to pause, send a pause response
    if (shouldPauseOrStop) {
      return res.json({
        message: `Campaign ${campaignName} is paused at index ${startIndex}.`,
      });
    }

    res.json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error(`Error in sendDrop: ${error.message}`);
    return next(new ApiError(`ERROR: Failed to send emails`, 500));
  }
});

exports.sendTest = expressAsyncHandler(async function (req, res) {
  const { username } = req.user;
  email_error_name = username;
  clearErrorLog();
  const { login, recipientes, placeholders, service, ...emailData } = req.body;

  // Replace placeholders and random values
  replacePlaceholders(emailData, placeholders);
  replaceRandomInObject(emailData);

  // Track results for each email attempt
  const results = {
    successful: [],
    failed: [],
    totalAttempted: 0,
  };

  // Process each login account sequentially to better handle auth errors
  for (const account of login) {
    // Create email promises for current account
    const accountEmailPromises = recipientes.map(async (recipient) => {
      const emailDetails = {
        ...emailData,
        sender_email: account.email,
        sender_email_password: account.app_password,
        to: recipient,
        service,
      };

      try {
        await sendEmail(emailDetails);
        results.successful.push({
          sender: account.email,
          recipient,
          timestamp: new Date(),
        });
      } catch (error) {
        results.failed.push({
          sender: account.email,
          recipient,
          error: error.message,
          errorCode: error.code,
          timestamp: new Date(),
        });

        // If it's an authentication error, break the loop for this account
        if (
          error.message.includes("Invalid login") ||
          error.message.includes("Invalid credentials") ||
          error.code === "EAUTH"
        ) {
          throw new Error(`Authentication failed for account ${account.email}`);
        }
      }
    });

    try {
      // Process all recipients for current account
      await Promise.all(accountEmailPromises);
    } catch (error) {
      console.error(`Error processing account ${account.email}:`, error);
      // Continue with next account if one fails
      continue;
    }
  }

  results.totalAttempted = results.successful.length + results.failed.length;

  // Create a new Test entry with detailed results
  const newTestEntry = new Test({
    campaignName: emailData.campaignName,
    mailer: emailData.mailer,
    isp: emailData.isp,
    offer: emailData.offer,
    affiliate_network: emailData.affiliate_network,
    total: recipientes.length,
    opens: 0,
    clicks: 0,
    successfulSends: results.successful.length,
    failedSends: results.failed.length,
    errors: results.failed.map((f) => ({
      sender: f.sender,
      recipient: f.recipient,
      error: f.error,
      timestamp: f.timestamp,
    })),
    sendDate: new Date(),
  });

  try {
    await newTestEntry.save();

    // Determine appropriate response status based on results
    const status =
      results.failed.length === 0
        ? 200
        : results.successful.length === 0
        ? 500
        : 207; // 207 Multi-Status for partial success

    res.status(status).json({
      message:
        results.failed.length === 0
          ? "All emails sent successfully!"
          : "Some emails failed to send. Check detailed results.",
      results: {
        totalAttempted: results.totalAttempted,
        successful: results.successful.length,
        failed: results.failed.length,
        failureDetails: results.failed,
      },
    });
  } catch (error) {
    console.error("Error saving test results:", error);
    res.status(500).json({
      message: "Error saving test results",
      error: error.message,
    });
  }
});

// first
// async function sendEmail(options) {
//   const { service, sender_email, sender_email_password, ...emailOptions } =
//     options;

//   try {
//     let transporter;

//     if (service === "gmail") {
//       transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: sender_email,
//           pass: sender_email_password,
//         },
//       });
//     } else {
//       throw new Error(
//         'Invalid email service provided. Use "gmail" or "outlook" or "yahoo".'
//       );
//     }

//     // Verify transporter credentials before sending
//     await transporter.verify();

//     // Process email options and send
//     let mailOptions = processEmailOptions(emailOptions, sender_email);
//     // let info = await transporter.sendMail(mailOptions);
//     let info = true;

//     return info;
//   } catch (error) {
//     // Enhance error message based on error type
//     let enhancedError = new Error(
//       error.code === "EAUTH"
//         ? `Authentication failed for ${sender_email}: Invalid password or authentication settings`
//         : error.message
//     );
//     enhancedError.code = error.code;
//     throw enhancedError;
//   }
// }

// Error logger utility
const logEmailError = async (error, details) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    type: error.code || "UNKNOWN",
    message: error.message,
    sender: details.sender_email,
    recipient: details.to,
    campaign: details.campaignName,
    service: details.service,
  };

  const logLine = JSON.stringify(logEntry) + "\n";
  const logFile = path.join(
    process.cwd(),
    "api",
    "errors",
    `${email_error_name}.txt`
  );

  try {
    await fs.appendFile(logFile, logLine);
  } catch (err) {
    console.error("Failed to write to error log:", err);
  }
};
// Function to clear error log file
const clearErrorLog = async () => {
  const logFile = path.join(
    process.cwd(),
    "api",
    "errors",
    `${email_error_name}.txt`
  );
  try {
    await fs.writeFile(logFile, "");
    return { success: true, message: "Error log cleared successfully" };
  } catch (err) {
    console.error("Failed to clear error log:", err);
    return { success: false, message: err.message };
  }
};

// second
async function sendEmail(options) {
  const { service, sender_email, sender_email_password, ...emailOptions } =
    options;

  try {
    let transporter;

    if (service === "gmail") {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: sender_email,
          pass: sender_email_password,
        },
      });
    } else {
      throw new Error(
        'Invalid email service provided. Use "gmail" or "outlook" or "yahoo".'
      );
    }

    await transporter.verify();
    let mailOptions = processEmailOptions(emailOptions, sender_email);
    let info = await transporter.sendMail(mailOptions);
    // let info = true;
    return info;
  } catch (error) {
    await logEmailError(error, { ...options });
    let enhancedError = new Error(
      error.code === "EAUTH"
        ? `Authentication failed for ${sender_email}: Invalid password or authentication settings`
        : error.message
    );
    enhancedError.code = error.code;
    throw enhancedError;
  }
}

// Helper function to process email options
function processEmailOptions(options, sender_email) {
  const {
    to,
    cc,
    bcc,
    replyTo,
    subject,
    text,
    html,
    from,
    contentTransferEncoding = "7bit",
    date = new Date(),
    messageId,
    xSgEid,
    xEntityId,
    xFeedbackId,
    listUnsubscribe,
    mimeVersion,
    xPriority,
    xCustomHeader,
    campaignName,
  } = options;

  let mailOptions = {
    from: `${from} <${sender_email}>`,
    to,
    cc,
    bcc,
    replyTo,
    subject,
    text,
    html: processHtml(html, to, campaignName),
    date,
    headers: {},
  };

  // Add headers if they exist
  const headers = {
    "Content-Transfer-Encoding": contentTransferEncoding,
    "Mime-Version": mimeVersion,
    "X-Priority": xPriority,
    "X-Custom-Header": xCustomHeader,
    "Message-ID": messageId,
    "X-SG-EID": xSgEid,
    "X-Entity-ID": xEntityId,
    "X-Feedback-ID": xFeedbackId,
    "List-Unsubscribe": listUnsubscribe,
  };

  for (const [key, value] of Object.entries(headers)) {
    if (value) mailOptions.headers[key] = value;
  }

  return mailOptions;
}

// Helper function to process HTML content
function processHtml(html, to, campaignName) {
  if (!html) return html;

  let processed = html.replace(
    /\[open\]/g,
    `tracking/open?email=${encodeURIComponent(
      to
    )}&campaign=${encodeURIComponent(campaignName)}`
  );

  const trackingUrl = `tracking/click?email=${encodeURIComponent(
    to
  )}&campaign=${encodeURIComponent(
    campaignName
  )}&destination=${encodeURIComponent("https://google.com")}`;
  processed = processed.replace(/\[url\]/g, trackingUrl);

  return processed;
}

exports.pauseCampaign = expressAsyncHandler(async function (req, res, next) {
  const { campaignName } = req.body;

  const drop = await Drop.findOneAndUpdate(
    { campaignName },
    { status: "paused" }
  );
  if (!drop) {
    return next(new ApiError(`campaign not found`));
  }
  res.json({
    message: `Campaign has been paused.`,
    status: "paused",
  });
});

exports.resumeCampaign = expressAsyncHandler(async function (req, res, next) {
  const { campaignName } = req.body;

  const drop = await Drop.findOneAndUpdate(
    { campaignName },
    { status: "active" }
  );
  if (!drop) {
    return next(new ApiError(`campaign not found`));
  }
  res.json({ message: `Campaign has resumed.`, status: "active", drop });
});

exports.stopCampaign = expressAsyncHandler(async function (req, res) {
  const { campaignName } = req.body;

  try {
    await Drop.updateOne({ campaignName }, { status: "stopped" });
    res.json({ message: `Campaign has been stopped.`, status: "stopped" });
  } catch (error) {
    console.error(`Error stopping campaign: ${error.message}`);
    res.status(500).json({ error: "Failed to stop campaign." });
  }
});

exports.readErrorLog = expressAsyncHandler(async function (req, res) {
  const email_error_name_file = req.user.username;
  const logFile = path.join(
    process.cwd(),
    "api",
    "errors",
    `${email_error_name_file}.txt`
  );
  try {
    const data = await fs.readFile(logFile, "utf8");
    const errors = data
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line));

    res.json({ success: true, message: "Error log read successfully", errors });
  } catch (err) {
    console.error("Failed to read error log:", err);
    return { success: false, message: err.message, errors: [] };
  }
});
