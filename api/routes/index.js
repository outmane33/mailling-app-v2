const authRoute = require("./authRoute");
const DropRoute = require("./DropRoute");
const sendersRoute = require("./sendersRoute");
const testRoute = require("./testRoute");
const trakingRoute = require("./trakingRoute");
const sendRoute = require("./sendRoute");
const statisticsRoute = require("./statisticsRoute");
const dataRoute = require("./dataRoute");
const imageRoute = require("./imageRoute");

const mouteRoutes = (app) => {
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/drop", DropRoute);
  app.use("/api/v1/test", testRoute);
  app.use("/api/v1/boites", sendersRoute);
  app.use("/api/v1/tracking", trakingRoute);
  app.use("/api/v1/send", sendRoute);
  app.use("/api/v1/statistics", statisticsRoute);
  app.use("/api/v1/data", dataRoute);
  app.use("/api/v1/images", imageRoute);
};

module.exports = mouteRoutes;
