const crypto = require("crypto");
const Payment = require("../models/Payment");
const Gig = require("../models/Gig");
const sendNotification = require("../utils/sendNotification");
const { getRazorpay } = require("../utils/razorpay");

const PLATFORM_FEE_RATE = 0.1;

// ==========================================================
// Create a Razorpay order for a completed gig's budget.
// The amount is derived from the gig server-side - never trusted from
// the client - to prevent a payer from tampering with what they're
// actually charged.
// ==========================================================
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { gigId } = req.body;

    const gig = await Gig.findById(gigId).populate("assignedTo", "name email");
    if (!gig) return res.status(404).json({ message: "Gig not found" });

    if (gig.userId.toString() !== req.userId)
      return res
        .status(403)
        .json({ message: "Only the project owner can release payment." });

    if (gig.status !== "completed")
      return res
        .status(400)
        .json({ message: "Payment can only be released for a completed project." });

    if (!gig.assignedTo)
      return res.status(400).json({ message: "This gig has no assigned freelancer." });

    const existing = await Payment.findOne({ gigId, status: "completed" });
    if (existing) {
      return res.status(200).json({ alreadyPaid: true, payment: existing });
    }

    const amount = gig.budget;
    // Razorpay expects the smallest currency unit (paise for INR).
    const amountInPaise = Math.round(amount * 100);

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `gig_${gig._id}`,
      notes: {
        gigId: gig._id.toString(),
        payerId: req.userId,
        payeeId: gig.assignedTo._id.toString(),
      },
    });

    res.status(201).json({
      orderId: order.id,
      amount: amountInPaise,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      gigTitle: gig.title,
      freelancerName: gig.assignedTo.name,
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================================
// Verify a completed Razorpay checkout and record the payment.
// Signature verification is the step that actually proves the payment
// happened - never trust razorpay_payment_id alone, it's guessable/
// forgeable by the client.
// ==========================================================
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      gigId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found" });

    if (gig.userId.toString() !== req.userId)
      return res
        .status(403)
        .json({ message: "Only the project owner can release payment." });

    if (!gig.assignedTo)
      return res.status(400).json({ message: "This gig has no assigned freelancer." });

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const signatureValid =
      expectedSignature.length === razorpay_signature?.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(razorpay_signature),
      );

    if (!signatureValid) {
      return res.status(400).json({ message: "Payment verification failed." });
    }

    const existing = await Payment.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existing) {
      return res.status(200).json(existing);
    }

    // Pull the actual payment method (card/upi/netbanking/wallet) from
    // Razorpay itself rather than trusting anything from the client.
    let method = "other";
    try {
      const razorpay = getRazorpay();
      const rpPayment = await razorpay.payments.fetch(razorpay_payment_id);
      if (["card", "upi", "netbanking", "wallet", "emi"].includes(rpPayment.method)) {
        method = rpPayment.method;
      }
    } catch (fetchErr) {
      console.error("Could not fetch Razorpay payment details:", fetchErr.message);
    }

    const amount = gig.budget;
    const payment = await Payment.create({
      gigId,
      payer: gig.userId,
      payee: gig.assignedTo,
      amount,
      platformFee: Number((amount * PLATFORM_FEE_RATE).toFixed(2)),
      status: "completed",
      method,
      methodDetail: method === "other" ? "" : method.toUpperCase(),
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    await sendNotification({
      userId: gig.assignedTo,
      title: "Payment Received",
      message: `A payment of ₹${amount} has been released for "${gig.title}".`,
      type: "payment",
      gig: gig._id,
    });

    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
};

exports.getMyPayments = async (req, res, next) => {
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
    next(err);
  }
};

// Kept for admin dispute-resolution flows; the normal client flow no
// longer leaves payments in "pending" (Razorpay verification finalizes
// them immediately), but a payment could still land in "disputed" and
// need this to move it back to "completed".
exports.confirmPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (payment.payer.toString() !== req.userId)
      return res.status(403).json({ message: "Only the payer can confirm" });

    if (payment.status !== "pending")
      return res.status(400).json({ message: "Payment is not pending" });

    payment.status = "completed";
    await payment.save();

    await sendNotification({
      userId: payment.payee,
      title: "Payment Confirmed",
      message: "Your payment has been confirmed by the client.",
      type: "payment",
      gig: payment.gigId,
    });

    res.json({ message: "Payment confirmed", payment });
  } catch (err) {
    next(err);
  }
};
