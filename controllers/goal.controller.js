const Goal = require("../models/goal.model");
const Transaction = require("../models/transaction.model");

// @desc    Get all financial goals
// @route   GET /api/goals
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ targetDate: 1 });

    const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
    const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);

    const goalsWithDetails = goals.map((g) => {
      const now = new Date();
      const diffTime = new Date(g.targetDate).getTime() - now.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const remainingAmount = Math.max(0, g.targetAmount - g.currentAmount);

      return {
        _id: g._id,
        title: g.title,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        remainingAmount: Number(remainingAmount.toFixed(2)),
        progressPercentage: g.progressPercentage,
        targetDate: g.targetDate,
        daysLeft,
        category: g.category,
        color: g.color,
        status: g.currentAmount >= g.targetAmount ? "achieved" : g.status,
        notes: g.notes,
        createdAt: g.createdAt,
      };
    });

    res.json({
      success: true,
      summary: {
        totalGoals: goals.length,
        totalTarget: Number(totalTarget.toFixed(2)),
        totalSaved: Number(totalSaved.toFixed(2)),
        overallPercentage:
          totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0,
      },
      goals: goalsWithDetails,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new goal
// @route   POST /api/goals
const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, currentAmount, targetDate, category, color, notes } = req.body;

    if (!title || !targetAmount || !targetDate) {
      return res.status(400).json({
        success: false,
        message: "Goal title, target amount, and target date are required.",
      });
    }

    const goal = await Goal.create({
      userId: req.user._id,
      title,
      targetAmount: Number(targetAmount),
      currentAmount: currentAmount ? Number(currentAmount) : 0,
      targetDate: new Date(targetDate),
      category: category || "Savings",
      color: color || "#10b981",
      notes: notes || "",
    });

    res.status(201).json({
      success: true,
      message: "Goal created successfully!",
      goal,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found." });
    }

    const { title, targetAmount, currentAmount, targetDate, category, color, status, notes } =
      req.body;

    if (title) goal.title = title;
    if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
    if (currentAmount !== undefined) goal.currentAmount = Number(currentAmount);
    if (targetDate) goal.targetDate = new Date(targetDate);
    if (category) goal.category = category;
    if (color) goal.color = color;
    if (status) goal.status = status;
    if (notes !== undefined) goal.notes = notes;

    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = "achieved";
    }

    await goal.save();

    res.json({
      success: true,
      message: "Goal updated successfully!",
      goal,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Deposit / add funds to a goal
// @route   POST /api/goals/:id/deposit
const depositToGoal = async (req, res) => {
  try {
    const { amount, logAsTransaction } = req.body;
    const depositAmount = Number(amount);

    if (!depositAmount || depositAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please specify a positive deposit amount.",
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found." });
    }

    goal.currentAmount += depositAmount;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = "achieved";
    }
    await goal.save();

    // Optionally log as an expense/savings transaction
    if (logAsTransaction) {
      await Transaction.create({
        userId: req.user._id,
        title: `Contribution to ${goal.title}`,
        amount: depositAmount,
        type: "expense",
        category: "Savings",
        date: new Date(),
        paymentMethod: "Bank Transfer",
        tags: ["Goal Savings", goal.category],
        notes: `Direct contribution toward goal: ${goal.title}`,
      });
    }

    res.json({
      success: true,
      message: `Added $${depositAmount} to ${goal.title}!`,
      goal,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found." });
    }

    res.json({ success: true, message: "Goal deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  depositToGoal,
  deleteGoal,
};
