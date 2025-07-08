const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const compression = require("compression");

dotenv.config({ path: "./config.env" });
const { dbConnection } = require("./config/connect");
const globalerrorHandler = require("./middlewares/globalErrorMiddleware");

//routes
const mouteRoutes = require("./routes");

//express app
const { app, server } = require("./utils/socket");

//database connect
dbConnection();

// const __dirname = path.resolve();

//middlewares
app.use(express.static(path.join(__dirname, "uploads")));

// Security middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);
app.use(helmet());

// Performance middleware
app.use(compression());
app.use(cookieParser());
app.use(
  express.json({
    limit: "5mb", // Reduced limit
    strict: true,
  })
);

// CORS setup
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Static files

//mout routes
mouteRoutes(app);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

// app.use(express.static(path.join(__dirname, "uploads")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
// });
//global error handler
app.use(globalerrorHandler);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log("Server started on port 8000");
});

// rejection outside express server
process.on("unhandledRejection", (err) => {
  console.log("unhandledRejection", err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
