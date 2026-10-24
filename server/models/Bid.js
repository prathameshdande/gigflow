const mongoose = require("mongoose");

const BidSchema = new mongoose.Schema(
  {
    gigId: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: { type: Number, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "hired", "rejected", "spam"],
      default: "pending",
    },
    adminApproved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

BidSchema.index({ gigId: 1, freelancerId: 1 }, { unique: true });
BidSchema.index({ freelancerId: 1, createdAt: -1 });
BidSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Bid", BidSchema);
