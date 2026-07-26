const router = require("express").Router();

const verifyToken = require("../middleware/verifyToken");

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");

// Get all notifications
router.get("/", verifyToken, getNotifications);

// Mark a single notification as read
router.patch("/:id/read", verifyToken, markAsRead);

// Mark all notifications as read
router.patch("/read-all", verifyToken, markAllAsRead);

module.exports = router;
