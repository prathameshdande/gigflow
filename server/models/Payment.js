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
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", PaymentSchema);
