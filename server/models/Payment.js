const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    gigId: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: Number,
    status: {
      type: String,
      enum: ["pending", "completed", "refunded", "disputed"],
      default: "pending",
    },
    platformFee: Number,
    method: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet", "emi", "other"],
    },
    // Non-sensitive display detail only (e.g. "UPI" or "Card"). Full card
    // numbers/CVVs are never sent to or stored by this server - Razorpay's
    // hosted checkout collects them directly.
    methodDetail: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true },
);

PaymentSchema.index({ payer: 1, createdAt: -1 });
PaymentSchema.index({ payee: 1, createdAt: -1 });
PaymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Payment", PaymentSchema);
