const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/authRoutes");
const gigRoutes = require("./routes/gigRoutes");
const bidRoutes = require("./routes/bidRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);



const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
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



app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GigFlow Backend Running 🚀",
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



const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication Error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);

    socket.userId = decoded.id;

    next();
  } catch (error) {
    next(new Error("Invalid Token"));
  }
});

io.on("connection", (socket) => {
  console.log(`User Connected : ${socket.userId}`);

  socket.on("joinRoom", (gigId) => {
    socket.join(gigId);
  });

  socket.on("sendMessage", async (data) => {
    try {
      const Message = require("./models/Message");

      const message = new Message({
        gigId: data.gigId,
        sender: socket.userId,
        receiver: data.receiver,
        content: data.content,
      });

      await message.save();

      const populatedMessage = await message.populate(
        "sender",
        "name profilePicture",
      );

      io.to(data.gigId).emit("newMessage", populatedMessage);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected : ${socket.userId}`);
  });
});



app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    const PORT = process.env.PORT || 8800;

    server.listen(PORT, () => {
      console.log(` Server Running on Port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB Connection Failed");
    console.error(error.message);
    process.exit(1);
  }
};

connectDB();
