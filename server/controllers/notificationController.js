const Notification = require("../models/Notification");

// =============================
// Get Notifications
// =============================

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =============================
// Mark One Notification Read
// =============================

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId,
      },
      {
        isRead: true,
      },
      {
        new: true,
      },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      notification,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =============================
// Mark All Notifications Read
// =============================

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        user: req.userId,
        isRead: false,
      },
      {
        isRead: true,
      },
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
