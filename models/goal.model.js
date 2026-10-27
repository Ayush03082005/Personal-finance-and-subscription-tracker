const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, "Target amount is required"],
      min: [1, "Target amount must be at least 1"],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, "Current amount cannot be negative"],
    },
    targetDate: {
      type: Date,
      required: [true, "Target date is required"],
    },
    category: {
      type: String,
      enum: [
        "Emergency Fund",
        "Savings",
        "Investment",
        "Vacation",
        "Gadget & Tech",
        "Home & Real Estate",
        "Vehicle",
        "Education",
        "Debt Payoff",
        "Other",
      ],
      default: "Savings",
    },
    color: {
      type: String,
      default: "#10b981",
    },
    status: {
      type: String,
      enum: ["in-progress", "achieved", "paused"],
      default: "in-progress",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for progress percentage
goalSchema.virtual("progressPercentage").get(function () {
  if (!this.targetAmount || this.targetAmount === 0) return 0;
  return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
});

module.exports = mongoose.model("Goal", goalSchema);
