const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Routes
const authRoutes = require("./routes/authRoutes");
const gigRoutes = require("./routes/gigRoutes");
const bidRoutes = require("./routes/bidRoutes");

dotenv.config();

const app = express();

/* ---------------- CORS FIX ---------------- */
const allowedOrigins = [
  "http://localhost:5173",
  "https://gigflow-umber.vercel.app",
  "https://gigflow-pi.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

// ✅ handle preflight requests (VERY IMPORTANT)
app.options("*", cors());

/* ---------------- MIDDLEWARE ---------------- */
app.use(express.json());
app.use(cookieParser());

/* ---------------- DB CONNECTION ---------------- */
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB error:", error);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("⚠ MongoDB disconnected");
});

/* ---------------- ROUTES ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/bids", bidRoutes);

/* ---------------- ROOT CHECK ---------------- */
app.get("/", (req, res) => {
  res.send("🚀 GigFlow API is running...");
});

/* ---------------- ERROR HANDLER ---------------- */
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

/* ---------------- SERVER ---------------- */
const PORT = process.env.PORT || 8800;

app.listen(PORT, () => {
  connect();
  console.log(`🚀 Server running on port ${PORT}`);
});