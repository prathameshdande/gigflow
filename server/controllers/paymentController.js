const Payment = require("../models/Payment");
const Gig = require("../models/Gig");

exports.createPayment = async (req, res) => {
  try {
    const { gigId, amount } = req.body;
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    const payment = new Payment({
      gigId,
      payer: gig.userId,
      payee: gig.assignedTo,
      amount,
      platformFee: amount * 0.1,
    });
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      $or: [{ payer: req.userId }, { payee: req.userId }],
    })
      .populate("gigId", "title")
      .populate("payer", "name")
      .populate("payee", "name")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.payer.toString() !== req.userId)
      return res.status(403).json({ message: "Only the payer can confirm" });
    if (payment.status !== "pending")
      return res.status(400).json({ message: "Payment is not pending" });

    payment.status = "completed";
    await payment.save();
    res.json({ message: "Payment confirmed", payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};