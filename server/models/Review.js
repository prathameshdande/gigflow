const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    gigId: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 2000 },
  },
  { timestamps: true },
);

// One review per reviewer per gig
ReviewSchema.index({ gigId: 1, reviewer: 1 }, { unique: true });
ReviewSchema.index({ targetUser: 1, createdAt: -1 });
ReviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Review", ReviewSchema);
