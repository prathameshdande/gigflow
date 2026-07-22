const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  try {
    const { gigId, receiver, content, fileUrl } = req.body;
    const message = new Message({
      gigId,
      sender: req.userId,
      receiver,
      content,
      fileUrl,
    });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ gigId: req.params.gigId })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
