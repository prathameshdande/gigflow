const path = require("path");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();
require("express-async-errors"); // auto-forwards async controller throws to the error handler

// ---------------------------------------------------------
// Fail fast on missing required configuration
// ---------------------------------------------------------
const REQUIRED_ENV = ["MONGO_URI", "JWT_KEY"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error(`Missing required environment variables: ${missingEnv.join(", ")}`);
  console.error("Copy server/.env.example to server/.env and fill in the values.");
  process.exit(1);
}

const { initSocket } = require("./socket");

const authRoutes = require("./routes/authRoutes");
const gigRoutes = require("./routes/gigRoutes");
const bidRoutes = require("./routes/bidRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const server = http.createServer(app);

// CLIENT_URL can be a single origin or a comma-separated list (e.g. your
// production Vercel URL plus a preview deployment URL).
const allowedOrigins = [
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  "http://localhost:5173",
];

const isDevOrigin = (origin) => {
  return origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
};

app.set("trust proxy", 1);

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV !== "production" && isDevOrigin(origin))
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize()); // strips $/. operators from user input (NoSQL injection)
app.use(hpp()); // prevents HTTP parameter pollution

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// Global API rate limit (routes needing tighter limits, e.g. auth, set their own)
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "GigFlow Backend Running 🚀" });
});

app.get("/api/health", (req, res) => {
  const stateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const isConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: isConnected ? "ok" : "warming_up",
    db: stateMap[mongoose.connection.readyState] || "unknown",
    readyState: mongoose.connection.readyState,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// Optionally serve the built client (single-server deployment)
const clientDist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// 404 for unmatched API routes
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Centralized error handler (also catches async errors via express-async-errors)
app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate value: " + Object.keys(err.keyValue || {}).join(", "),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: `Invalid ${err.path}` });
  }

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ success: false, message: "CORS origin not allowed" });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

initSocket(server, allowedOrigins);

// Once connected, log (don't crash on) transient DB blips - e.g. Atlas
// free-tier idle disconnects, or a brief network hiccup on Render. The
// MongoDB driver reconnects automatically; these listeners just make that
// visible in the logs instead of it looking like the app silently hung.
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected - driver will attempt to reconnect");
});
mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

// Enable query buffering with extended timeout for smooth cold-start handling
mongoose.set("bufferCommands", true);
mongoose.set("bufferTimeoutMS", 30000);

// Start listening immediately so cloud reverse proxies (Render, Vercel) and clients
// get active responses immediately rather than connection refused or 502 Bad Gateway
const PORT = process.env.PORT || 8800;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const connectDB = async (retries = 6, delay = 1500) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
      });
      console.log(
        `MongoDB Connected -> db: "${mongoose.connection.name}" host: ${mongoose.connection.host}`,
      );
      return;
    } catch (error) {
      console.error(`MongoDB Connection Attempt ${attempt}/${retries} Failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise((res) => setTimeout(res, delay));
        delay = Math.min(delay * 1.5, 10000);
      }
    }
  }
  console.warn("MongoDB failed to connect after multiple retries. Server will keep trying in background...");
  setTimeout(() => connectDB(retries, delay), 5000);
};

connectDB();

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => mongoose.connection.close(false).then(() => process.exit(0)));
});

// Without these, an uncaught error anywhere outside an Express request
// handler (e.g. a stray promise rejection in a background task) crashes
// the process with just a bare Node stack trace, which on a host like
// Render just looks like the app randomly died. Log clearly, then exit so
// the platform's process manager restarts it cleanly rather than leaving
// it in an unknown state.
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION - shutting down:", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION - shutting down:", err);
  process.exit(1);
});

module.exports = app;
