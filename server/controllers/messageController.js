const Message = require("../models/Message");
const Gig = require("../models/Gig");
const sendNotification = require("../utils/sendNotification");

exports.sendMessage = async (req, res, next) => {
  try {
    const { gigId, receiver, content, fileUrl } = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: "Gig not found" });
    }

    const isOwner = gig.userId && gig.userId.toString() === req.userId;
    const isAssigned = gig.assignedTo && gig.assignedTo.toString() === req.userId;

    if (!isOwner && !isAssigned) {
      return res
        .status(403)
        .json({ success: false, message: "You are not allowed to send messages." });
    }

    // Receiver must actually be the other party on this gig.
    const validReceiver = isOwner
      ? gig.assignedTo?.toString() === receiver
      : gig.userId.toString() === receiver;

    if (!validReceiver) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid message receiver for this gig." });
    }

    const message = await Message.create({
      gigId,
      sender: req.userId,
      receiver,
      content,
      fileUrl,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name avatar email")
      .populate("receiver", "name avatar email");

    await sendNotification({
      userId: receiver,
      title: "New Message",
      message: `${populatedMessage.sender.name} sent you a message.`,
      type: "message",
      gig: gigId,
    });

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (err) {
    next(err);
  }
};

// ============================
// Get Messages
// ============================
exports.getMessages = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: "Gig not found" });
    }

    const isOwner = gig.userId && gig.userId.toString() === req.userId;
    const isAssigned = gig.assignedTo && gig.assignedTo.toString() === req.userId;

    if (!isOwner && !isAssigned) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const messages = await Message.find({ gigId: req.params.gigId })
      .populate("sender", "name avatar email")
      .populate("receiver", "name avatar email")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    next(err);
  }
};
