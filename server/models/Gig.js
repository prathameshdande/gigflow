const mongoose = require("mongoose");

const GigSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    budget: { type: Number, required: true },
    deadline: Date,
    status: {
      type: String,
      enum: ["open", "assigned", "inProgress", "completed", "closed"],
      default: "open",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    submission: {
      files: [String],
      message: String,
      submittedAt: Date,
    },
  },
  { timestamps: true },
);

GigSchema.index({ title: "text" });
module.exports = mongoose.model("Gig", GigSchema);
