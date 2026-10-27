const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Subscription name is required"],
      trim: true,
    },
    cost: {
      type: Number,
      required: [true, "Subscription cost is required"],
      min: [0, "Cost cannot be negative"],
    },
    billingCycle: {
      type: String,
      enum: ["weekly", "monthly", "quarterly", "yearly"],
      default: "monthly",
    },
    category: {
      type: String,
      enum: [
        "Streaming",
        "Software & AI",
        "Cloud & Hosting",
        "Fitness",
        "Music",
        "News & Learning",
        "Gaming",
        "Utilities",
        "Food & Delivery",
        "Other",
      ],
      default: "Streaming",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    nextBillingDate: {
      type: Date,
      required: [true, "Next billing date is required"],
      default: () => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d;
      },
    },
    status: {
      type: String,
      enum: ["active", "paused", "cancelled"],
      default: "active",
      index: true,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    reminderDaysBefore: {
      type: Number,
      default: 3,
      min: 0,
    },
    paymentMethod: {
      type: String,
      default: "Credit Card",
    },
    cancellationUrl: {
      type: String,
      trim: true,
      default: "",
    },
    websiteUrl: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    color: {
      type: String,
      default: "#6366f1",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for monthly equivalent cost
subscriptionSchema.virtual("monthlyEquivalentCost").get(function () {
  if (this.billingCycle === "weekly") {
    return Number((this.cost * 4.333).toFixed(2));
  } else if (this.billingCycle === "quarterly") {
    return Number((this.cost / 3).toFixed(2));
  } else if (this.billingCycle === "yearly") {
    return Number((this.cost / 12).toFixed(2));
  }
  return this.cost; // monthly
});

// Virtual for days until next renewal
subscriptionSchema.virtual("daysUntilRenewal").get(function () {
  if (!this.nextBillingDate) return null;
  const now = new Date();
  const diffTime = new Date(this.nextBillingDate).getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
