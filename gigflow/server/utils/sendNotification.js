const Notification = require("../models/Notification");
const { getIO } = require("../socket");

/**
 * Creates a notification in the DB and pushes it in real time
 * to the target user's socket room, if they're connected.
 */
const sendNotification = async ({ userId, title, message, type, gig }) => {
  try {
    if (!userId) return null;

    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      gig,
    });

    const io = getIO();
    if (io) {
      io.to(userId.toString()).emit("newNotification", notification);
    }

    return notification;
  } catch (err) {
    console.error("Notification Error:", err);
    return null;
  }
};

module.exports = sendNotification;
