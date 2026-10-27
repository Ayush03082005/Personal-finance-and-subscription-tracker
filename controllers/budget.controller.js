const Budget = require("../models/budget.model");
const Transaction = require("../models/transaction.model");

// @desc    Get all budgets with real-time spending progress & alert status
// @route   GET /api/budgets
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id }).sort({ category: 1 });

    // Calculate current month's start and end date
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Fetch this month's expense transactions
    const monthlyExpenses = await Transaction.find({
      userId: req.user._id,
      type: "expense",
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Group expenses by category
    const categorySpending = {};
    monthlyExpenses.forEach((tx) => {
      categorySpending[tx.category] = (categorySpending[tx.category] || 0) + tx.amount;
    });

    let totalBudgeted = 0;
    let totalSpent = 0;
    let exceededCount = 0;
    let warningCount = 0;

    const budgetsWithPerformance = budgets.map((b) => {
      const spent = categorySpending[b.category] || 0;
      totalBudgeted += b.monthlyLimit;
      totalSpent += spent;

      const percentage = Math.round((spent / b.monthlyLimit) * 100);
      const remaining = Number((b.monthlyLimit - spent).toFixed(2));

      let status = "safe";
      if (spent > b.monthlyLimit) {
        status = "exceeded";
        exceededCount++;
      } else if (percentage >= b.alertThreshold) {
        status = "warning";
        warningCount++;
      }

      return {
        _id: b._id,
        category: b.category,
        monthlyLimit: b.monthlyLimit,
        alertThreshold: b.alertThreshold,
        color: b.color,
        spent: Number(spent.toFixed(2)),
        remaining,
        percentage,
        status,
        createdAt: b.createdAt,
      };
    });

    res.json({
      success: true,
      summary: {
        totalBudgeted: Number(totalBudgeted.toFixed(2)),
        totalSpent: Number(totalSpent.toFixed(2)),
        totalRemaining: Number((totalBudgeted - totalSpent).toFixed(2)),
        overallPercentage: totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0,
        exceededCount,
        warningCount,
      },
      budgets: budgetsWithPerformance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a category budget
// @route   POST /api/budgets
const createBudget = async (req, res) => {
  try {
    const { category, monthlyLimit, alertThreshold, color } = req.body;

    if (!category || !monthlyLimit) {
      return res.status(400).json({
        success: false,
        message: "Category and monthly limit are required.",
      });
    }

    const existing = await Budget.findOne({
      userId: req.user._id,
      category: category.trim(),
    });

    if (existing) {
      existing.monthlyLimit = Number(monthlyLimit);
      if (alertThreshold) existing.alertThreshold = Number(alertThreshold);
      if (color) existing.color = color;
      await existing.save();

      return res.json({
        success: true,
        message: `Updated budget limit for ${category}.`,
        budget: existing,
      });
    }

    const budget = await Budget.create({
      userId: req.user._id,
      category: category.trim(),
      monthlyLimit: Number(monthlyLimit),
      alertThreshold: alertThreshold ? Number(alertThreshold) : 80,
      color: color || "#6366f1",
    });

    res.status(201).json({
      success: true,
      message: "Budget created successfully!",
      budget,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a budget
// @route   PUT /api/budgets/:id
const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({ success: false, message: "Budget not found." });
    }

    const { category, monthlyLimit, alertThreshold, color } = req.body;
    if (category) budget.category = category.trim();
    if (monthlyLimit !== undefined) budget.monthlyLimit = Number(monthlyLimit);
    if (alertThreshold !== undefined) budget.alertThreshold = Number(alertThreshold);
    if (color) budget.color = color;

    await budget.save();

    res.json({
      success: true,
      message: "Budget updated successfully!",
      budget,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({ success: false, message: "Budget not found." });
    }

    res.json({ success: true, message: "Budget deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
