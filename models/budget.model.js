const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    monthlyLimit: {
      type: Number,
      required: [true, "Monthly limit is required"],
      min: [1, "Limit must be at least 1"],
    },
    alertThreshold: {
      type: Number,
      default: 80, // % of limit at which an alert triggers
      min: 10,
      max: 100,
    },
    color: {
      type: String,
      default: "#6366f1",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one budget per category per user
budgetSchema.index({ userId: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);
