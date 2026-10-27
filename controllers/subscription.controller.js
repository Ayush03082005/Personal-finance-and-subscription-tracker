const Subscription = require("../models/subscription.model");
const Transaction = require("../models/transaction.model");

// @desc    Get all subscriptions for logged-in user
// @route   GET /api/subscriptions
const getSubscriptions = async (req, res) => {
  try {
    const { status, category, search, sortBy } = req.query;
    const filter = { userId: req.user._id };

    if (status && status !== "all") {
      filter.status = status;
    }
    if (category && category !== "all") {
      filter.category = category;
    }
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    let sort = { nextBillingDate: 1 };
    if (sortBy === "cost-desc") sort = { cost: -1 };
    if (sortBy === "cost-asc") sort = { cost: 1 };
    if (sortBy === "name") sort = { name: 1 };

    const subscriptions = await Subscription.find(filter).sort(sort);

    // Compute metrics
    let totalMonthlyRecurring = 0;
    let totalYearlyRecurring = 0;
    let activeCount = 0;
    let pausedCount = 0;
    let cancelledCount = 0;

    subscriptions.forEach((sub) => {
      if (sub.status === "active") {
        activeCount++;
        const monthly = sub.monthlyEquivalentCost || 0;
        totalMonthlyRecurring += monthly;
        totalYearlyRecurring += monthly * 12;
      } else if (sub.status === "paused") {
        pausedCount++;
      } else if (sub.status === "cancelled") {
        cancelledCount++;
      }
    });

    res.json({
      success: true,
      count: subscriptions.length,
      metrics: {
        activeCount,
        pausedCount,
        cancelledCount,
        totalMonthlyRecurring: Number(totalMonthlyRecurring.toFixed(2)),
        totalYearlyRecurring: Number(totalYearlyRecurring.toFixed(2)),
      },
      subscriptions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get upcoming subscription renewals
// @route   GET /api/subscriptions/upcoming
const getUpcomingRenewals = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const upcoming = await Subscription.find({
      userId: req.user._id,
      status: "active",
      nextBillingDate: { $gte: now, $lte: cutoffDate },
    }).sort({ nextBillingDate: 1 });

    const totalUpcomingCost = upcoming.reduce((acc, sub) => acc + sub.cost, 0);

    res.json({
      success: true,
      windowDays: days,
      count: upcoming.length,
      totalUpcomingCost: Number(totalUpcomingCost.toFixed(2)),
      subscriptions: upcoming,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single subscription
// @route   GET /api/subscriptions/:id
const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found." });
    }

    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new subscription
// @route   POST /api/subscriptions
const createSubscription = async (req, res) => {
  try {
    const {
      name,
      cost,
      billingCycle,
      category,
      startDate,
      nextBillingDate,
      status,
      autoRenew,
      reminderDaysBefore,
      paymentMethod,
      cancellationUrl,
      websiteUrl,
      notes,
      color,
    } = req.body;

    if (!name || cost === undefined || cost === null) {
      return res.status(400).json({
        success: false,
        message: "Subscription name and cost are required.",
      });
    }

    // Default next billing date if not specified
    let nextDate = nextBillingDate ? new Date(nextBillingDate) : null;
    if (!nextDate || isNaN(nextDate.getTime())) {
      nextDate = new Date();
      if (billingCycle === "yearly") nextDate.setFullYear(nextDate.getFullYear() + 1);
      else if (billingCycle === "quarterly") nextDate.setMonth(nextDate.getMonth() + 3);
      else if (billingCycle === "weekly") nextDate.setDate(nextDate.getDate() + 7);
      else nextDate.setMonth(nextDate.getMonth() + 1);
    }

    const subscription = await Subscription.create({
      userId: req.user._id,
      name,
      cost: Number(cost),
      billingCycle: billingCycle || "monthly",
      category: category || "Streaming",
      startDate: startDate ? new Date(startDate) : new Date(),
      nextBillingDate: nextDate,
      status: status || "active",
      autoRenew: autoRenew !== undefined ? autoRenew : true,
      reminderDaysBefore: reminderDaysBefore !== undefined ? Number(reminderDaysBefore) : 3,
      paymentMethod: paymentMethod || "Credit Card",
      cancellationUrl: cancellationUrl || "",
      websiteUrl: websiteUrl || "",
      notes: notes || "",
      color: color || "#6366f1",
    });

    res.status(201).json({
      success: true,
      message: "Subscription added successfully!",
      subscription,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
const updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found." });
    }

    const fields = [
      "name",
      "cost",
      "billingCycle",
      "category",
      "startDate",
      "nextBillingDate",
      "status",
      "autoRenew",
      "reminderDaysBefore",
      "paymentMethod",
      "cancellationUrl",
      "websiteUrl",
      "notes",
      "color",
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        if (f === "cost" || f === "reminderDaysBefore") {
          subscription[f] = Number(req.body[f]);
        } else if (f === "startDate" || f === "nextBillingDate") {
          subscription[f] = new Date(req.body[f]);
        } else {
          subscription[f] = req.body[f];
        }
      }
    });

    await subscription.save();

    res.json({
      success: true,
      message: "Subscription updated successfully!",
      subscription,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle subscription status (active <-> paused <-> cancelled)
// @route   PATCH /api/subscriptions/:id/status
const toggleSubscriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "paused", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found." });
    }

    res.json({
      success: true,
      message: `Subscription marked as ${status}.`,
      subscription,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete subscription
// @route   DELETE /api/subscriptions/:id
const deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found." });
    }

    res.json({
      success: true,
      message: "Subscription deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record subscription charge into Transactions
// @route   POST /api/subscriptions/:id/log-payment
const logRenewalAsTransaction = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found." });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      title: `${subscription.name} Renewal`,
      amount: subscription.cost,
      type: "expense",
      category: "Subscriptions",
      date: new Date(),
      paymentMethod: subscription.paymentMethod || "Credit Card",
      isRecurring: true,
      subscriptionId: subscription._id,
      tags: ["Subscription", subscription.category],
      notes: `Logged automatic payment for ${subscription.name} (${subscription.billingCycle}).`,
    });

    // Advance the next billing date automatically!
    const nextDate = new Date(subscription.nextBillingDate);
    if (subscription.billingCycle === "yearly") {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else if (subscription.billingCycle === "quarterly") {
      nextDate.setMonth(nextDate.getMonth() + 3);
    } else if (subscription.billingCycle === "weekly") {
      nextDate.setDate(nextDate.getDate() + 7);
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    subscription.nextBillingDate = nextDate;
    await subscription.save();

    res.status(201).json({
      success: true,
      message: `Recorded payment of ${subscription.cost} for ${subscription.name} and advanced next billing date!`,
      transaction,
      subscription,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSubscriptions,
  getUpcomingRenewals,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  toggleSubscriptionStatus,
  deleteSubscription,
  logRenewalAsTransaction,
};
