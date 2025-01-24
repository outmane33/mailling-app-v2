const expressAsyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const puppeteer = require("puppeteer");
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
const Recipiente_Gmail = require("../models/recipiente_Gmail_Model.js");

let email_error_name = "email_error";
let emailSendCounter = 1;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    const models = [Recipiente_Charter, Recipiente_RR, Recipiente_Gmail];
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
    emailSendCounter = 1;

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

      if (service !== "outlook") {
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
      } else {
        const account = login[loginIndex];
        const emailDetails = {
          ...emailData,
          sender_email: account.email,
          sender_email_password: account.app_password,
          service,
          afterTest,
          testEmail,
        };

        const batchSize = duplicate; // Collect 4 recipients
        let recipientBatch = selectedRecipients.slice(i, i + batchSize);

        recipientBatch = recipientBatch.map((recipient) => recipient.email);

        emailDetails.to = recipientBatch;

        //realtime functionality
        const receiverSocketId = getReceiverSocketId(req.user._id.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("emailSent", {
            campaignName,
            emailSentCount: emailSentCount + 1,
            total: count,
          });
        }

        // Process the batch of recipients
        await processAccount(emailDetails);

        // Adjust loop index to skip processed recipients
        i += batchSize - 1;

        emailSentCount += recipientBatch.length;

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
    try {
      const emailDetails = {
        ...emailData,
        sender_email: account.email,
        sender_email_password: account.app_password,
        to: service !== "outlook" ? recipientes : recipientes,
        service,
      };

      if (service !== "outlook") {
        const accountEmailPromises = recipientes.map(async (recipient) => {
          const recipientEmailDetails = { ...emailDetails, to: recipient };

          try {
            await handleService(service, recipientEmailDetails);
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

            if (
              error.message.includes("Invalid login") ||
              error.message.includes("Invalid credentials") ||
              error.code === "EAUTH"
            ) {
              throw new Error(
                `Authentication failed for account ${account.email}`
              );
            }
          }
        });

        await Promise.all(accountEmailPromises);
      } else {
        await handleService(service, emailDetails);
        results.successful.push({
          sender: account.email,
          recipient: recipientes,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error(`Error processing account ${account.email}:`, error);
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

const handleService = (service, emailDetails) => {
  switch (service) {
    case "gmail":
      return sendEmail(emailDetails);
    case "outlook":
      return processAccount(emailDetails);
    case "yahoo":
      return true;
    default:
      return sendEmail(emailDetails);
  }
};

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

// send email by app_password
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

//send email by browser
async function processAccount(options) {
  let browser;
  let verificationBrowser;
  let emailMoved = false;

  try {
    browser = await puppeteer.launch({
      headless: false,
      ignoreHTTPSErrors: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-features=DesktopPWAPermissionRequests",
      ],
    });

    // Added browser disconnection handler
    browser.on("disconnected", () => {
      if (!emailMoved) {
        console.log(
          `Browser disconnected before email was moved for ${options.sender_email}`
        );
      }
    });

    // Create a new page
    const page = await browser.newPage();

    // Navigate to the login page
    await page.goto("https://login.live.com/");
    // Wait for the email field to be visible
    await page.waitForSelector('input[type="email"]', { visible: true });
    // Type the email
    await page.type('input[type="email"]', options.sender_email);
    // Click the login button
    await page.click('button[type="submit"]');
    // Wait for the password field to be visible
    await page.waitForSelector('input[type="password"]', { visible: true });
    // Type the password
    await page.type('input[type="password"]', options.sender_email_password);
    // Click the login button
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: "networkidle0" });

    // Handle 'Stay signed in?' prompt
    try {
      await page.waitForSelector("#acceptButton", {
        visible: true,
        timeout: 5000,
      });
      await page.click("#acceptButton");
    } catch (error) {
      console.log(
        "No 'Stay signed in?' prompt found, proceeding with verification..."
      );

      let inputEmail = email.split("@")[0];
      try {
        await page.waitForSelector('input[type="email"]', {
          visible: true,
          timeout: 5000,
        });
        await page.type('input[type="email"]', inputEmail);

        await page.waitForSelector(
          'input[type="submit"][id="iSelectProofAction"]',
          { visible: true }
        );
        await page.click('input[type="submit"][id="iSelectProofAction"]');

        verificationBrowser = await puppeteer.launch({
          headless: false,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const verificationPage = await verificationBrowser.newPage();
        await verificationPage.goto("https://inboxes.com/", {
          waitUntil: "domcontentloaded",
        });

        let securityCode = await new Promise(async (resolve, reject) => {
          setTimeout(async () => {
            try {
              // ---------------------------------------------------------------
              // Click the button get my first inbox
              const buttonSelector =
                "button.text-center.font-medium.px-6.py-3\\.5.text-base.text-white.bg-primary-700";

              await verificationPage.waitForSelector(buttonSelector, {
                visible: true,
              });

              try {
                await verificationPage.click(buttonSelector);
              } catch (error) {
                console.error("Failed to click the button:", error);
              }
              // ---------------------------------------------------------------
              // write inputEmail
              const inputSelector =
                "input[type='text'][placeholder='Enter username']";

              await verificationPage.waitForSelector(inputSelector, {
                visible: true,
              });

              // Type the username into the input field
              try {
                await verificationPage.type(inputSelector, inputEmail, {
                  delay: 100,
                }); // Types with a slight delay between keystrokes
              } catch (error) {
                console.error("Failed to type into the input field:", error);
              }
              // ---------------------------------------------------------------
              // Select "getairmail.com" from the dropdown
              const selectSelector = "select.block.w-full.text-gray-900";
              await verificationPage.waitForSelector(selectSelector, {
                visible: true,
              });

              try {
                await verificationPage.select(selectSelector, "getairmail.com");
              } catch (error) {
                console.error("Failed to select 'getairmail.com':", error);
              }

              // ---------------------------------------------------------------
              // Click the "Add Inbox" button
              const addInboxButtonSelector =
                "button.text-center.font-medium.px-5.py-2\\.5.text-sm.text-white.bg-primary-700";

              await verificationPage.waitForSelector(addInboxButtonSelector, {
                visible: true,
              });

              try {
                // Click the button by checking its text content
                await verificationPage.evaluate(
                  (selector, buttonText) => {
                    const button = [
                      ...document.querySelectorAll(selector),
                    ].find((el) => el.textContent.trim() === buttonText);
                    if (button) {
                      button.click();
                    } else {
                      throw new Error(
                        "Button with the specified text not found."
                      );
                    }
                  },
                  addInboxButtonSelector,
                  "Add Inbox"
                );
              } catch (error) {
                console.error("Failed to click the 'Add Inbox' button:", error);
              }

              // ---------------------------------------------------------------
              // Wait for 10 seconds and then refresh the page
              await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10 seconds using setTimeout

              // Refresh the page
              //   try {
              //     await verificationPage.reload();
              //     console.log("Page refreshed successfully.");
              //   } catch (error) {
              //     console.error("Failed to refresh the page:", error);
              //   }
              // ---------------------------------------------------------------
              // Click the first row in the table
              const firstRowSelector = "table tbody tr";
              await verificationPage.waitForSelector(firstRowSelector, {
                visible: true,
              });

              try {
                // Use page.click() with the first row selector
                await verificationPage.click(`${firstRowSelector}:first-child`);

                // Alternatively, if the above doesn't work
                await verificationPage.evaluate(() => {
                  const firstRow = document.querySelector("table tbody tr");
                  if (firstRow) {
                    firstRow.click();
                  }
                });
              } catch (error) {
                console.error("Failed to click the first row:", error);
              }
              // ---------------------------------------------------------------
              //read the verification code
              await new Promise((resolve) => setTimeout(resolve, 5000));
              const verificationCodeSelector = 'tr td[id="i4"] span';

              try {
                const verificationCode = await verificationPage.evaluate(
                  (selector) => {
                    const codeElement = document.querySelector(selector);
                    return codeElement ? codeElement.textContent.trim() : null;
                  },
                  verificationCodeSelector
                );

                if (verificationCode) {
                  resolve(code);
                } else {
                  reject(new Error("Failed to extract security code"));
                  return;
                }
              } catch (error) {
                reject(error);
              }
            } catch (error) {
              reject(error);
            }
          }, 20000);
        });

        if (verificationBrowser) {
          await verificationBrowser.close();
        }

        console.log("Security Code obtained:", securityCode);

        await page.waitForSelector("#iOttText", { visible: true });
        await page.type("#iOttText", securityCode);

        await page.waitForSelector("#iVerifyCodeAction", { visible: true });
        await page.click("#iVerifyCodeAction");

        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (verificationError) {
        console.error("Error during verification process:", verificationError);
      }
      try {
        await page.waitForSelector('input[type="email"]', {
          visible: true,
          timeout: 5000,
        });
        await page.type('input[type="email"]', inputEmail);

        await page.waitForSelector(
          'input[type="submit"][id="iSelectProofAction"]',
          { visible: true }
        );
        await page.click('input[type="submit"][id="iSelectProofAction"]');

        verificationBrowser = await puppeteer.launch({
          headless: false,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const verificationPage = await verificationBrowser.newPage();
        await verificationPage.goto(
          "https://mailnesia.com/mailbox/tenciseabbe"
        );

        let securityCode = await new Promise(async (resolve, reject) => {
          setTimeout(async () => {
            try {
              await verificationPage.waitForSelector("#mailbox", {
                visible: true,
              });
              await verificationPage.click("#mailbox");
              await verificationPage.evaluate(() => {
                document.querySelector("#mailbox").value = "";
              });

              await verificationPage.type("#mailbox", inputEmail);
              await verificationPage.waitForSelector("#sm", { visible: true });
              await verificationPage.keyboard.press("Enter");

              await verificationPage.waitForSelector(".emailheader", {
                visible: true,
              });
              await new Promise((r) => setTimeout(r, 2000));
              await verificationPage.click(".emailheader");
              await new Promise((r) => setTimeout(r, 2000));

              const code = await verificationPage.evaluate(() => {
                const tdElement = document.querySelector('td[id="i4"]');
                if (!tdElement) return null;
                const spanElement = tdElement.querySelector("span");
                if (!spanElement) return null;
                return spanElement.textContent.trim();
              });

              if (!code) {
                reject(new Error("Failed to extract security code"));
                return;
              }

              resolve(code);
            } catch (error) {
              reject(error);
            }
          }, 20000);
        });

        if (verificationBrowser) {
          await verificationBrowser.close();
        }

        console.log("Security Code obtained:", securityCode);

        await page.waitForSelector("#iOttText", { visible: true });
        await page.type("#iOttText", securityCode);

        await page.waitForSelector("#iVerifyCodeAction", { visible: true });
        await page.click("#iVerifyCodeAction");

        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (verificationError) {
        console.error("Error during verification process:", verificationError);
      }
      try {
        await page.waitForSelector("#iNext", {
          visible: true,
          timeout: 5000,
        });
        await page.click("#iNext");
      } catch (error) {
        console.log("Error during verification process:", error);
      }
      try {
        await page.waitForSelector("#acceptButton", {
          visible: true,
          timeout: 5000,
        });
        await page.click("#acceptButton");
      } catch (error) {
        console.log("Error during verification process:", error);
      }
    }

    await delay(5000);
    await page.goto("https://outlook.live.com/mail/0/");

    for (let i = 0; i < options.to.length; i++) {
      if (emailSendCounter % options.afterTest === 0) {
        options.to.push(options.testEmail);
      }
      // ------------------------------------------------------------ Click the "Nouveau message" button
      await page.waitForSelector('button[aria-label="Nouveau message"]', {
        visible: true,
        timeout: 120000, // 120 seconds = 2 minutes
      });
      await page.click('button[aria-label="Nouveau message"]');
      // ------------------------------------------------------------ Write the recipient email
      await page.waitForSelector('div[aria-label="À"]', {
        visible: true,
        timeout: 120000, // 120 seconds = 2 minutes
      });
      await page.type('div[aria-label="À"]', options.to[i]);
      // ------------------------------------------------------------Write the subject
      await page.waitForSelector('input[aria-label="Ajouter un objet"]', {
        visible: true,
        timeout: 120000, // 120 seconds = 2 minutes
      });
      await page.type('input[aria-label="Ajouter un objet"]', options.subject);
      // ------------------------------------------------------------ Write the message body
      await page.waitForSelector(
        'div[aria-label="Corps du message, appuyez sur Alt+F10 pour quitter"]',
        {
          visible: true,
          timeout: 120000, // 120 seconds = 2 minutes
        }
      );
      await page.evaluate((html) => {
        const element = document.querySelector(
          'div[aria-label="Corps du message, appuyez sur Alt+F10 pour quitter"]'
        );
        element.innerHTML = html;
      }, `${options.html ? options.html : options.text}`);

      // ------------------------------------------------------------ Click the "Envoyer" button
      await page.waitForSelector('button[aria-label="Envoyer"]', {
        visible: true,
        timeout: 120000, // 120 seconds = 2 minutes
      });
      await page.click('button[aria-label="Envoyer"]');
      emailSendCounter++;
    }
  } catch (error) {
    console.log("Error during verification process:", error);
  } finally {
    await delay(5000);
    await browser.close();
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
