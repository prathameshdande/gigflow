const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io = null;

/**
 * Initializes the Socket.IO server and attaches auth + event handlers.
 * Must be called once from index.js after the HTTP server is created.
 */
function initSocket(server, allowedOrigins) {
  const Gig = require("./models/Gig");
  const Message = require("./models/Message");

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

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
    console.log(`User Connected: ${socket.userId}`);
    socket.join(socket.userId);

    socket.on("joinRoom", async (gigId) => {
      try {
        const gig = await Gig.findById(gigId);
        if (!gig) return;

        const isOwner = gig.userId && gig.userId.toString() === socket.userId;
        const isAssigned =
          gig.assignedTo && gig.assignedTo.toString() === socket.userId;

        if (!isOwner && !isAssigned) {
          console.log("Unauthorized room join");
          return;
        }

        socket.join(gigId);
        console.log(`${socket.userId} joined room ${gigId}`);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("sendMessage", async (data) => {
      try {
        const gig = await Gig.findById(data.gigId);
        if (!gig) return;

        const isOwner = gig.userId && gig.userId.toString() === socket.userId;
        const isAssigned =
          gig.assignedTo && gig.assignedTo.toString() === socket.userId;

        if (!isOwner && !isAssigned) {
          console.log("Unauthorized message");
          return;
        }

        const message = await Message.create({
          gigId: data.gigId,
          sender: socket.userId,
          receiver: data.receiver,
          content: data.content,
          fileUrl: data.fileUrl || "",
        });

        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "name");

        io.to(data.gigId).emit("newMessage", populatedMessage);
        console.log(`Message sent in room ${data.gigId}`);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User Disconnected: ${socket.userId}`);
    });
  });

  return io;
}

/**
 * Returns the live Socket.IO instance. Controllers must call this
 * lazily (inside handlers), never destructure it at require-time,
 * otherwise they capture `null` due to module load ordering.
 */
function getIO() {
  return io;
}

module.exports = { initSocket, getIO };
