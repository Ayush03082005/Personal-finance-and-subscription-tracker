const Transaction = require("../models/transaction.model");

// @desc    Get transactions with search and filter
// @route   GET /api/transactions
const getTransactions = async (req, res) => {
  try {
    const { search, type, category, startDate, endDate, limit, page } = req.query;
    const filter = { userId: req.user._id };

    if (type && type !== "all") {
      filter.type = type;
    }
    if (category && category !== "all") {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const pageSize = parseInt(limit) || 50;
    const currentPage = parseInt(page) || 1;
    const skip = (currentPage - 1) * pageSize;

    const totalCount = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    // Calculate income / expense totals for the filtered set
    let totalIncome = 0;
    let totalExpense = 0;

    const allFiltered = await Transaction.find(filter);
    allFiltered.forEach((t) => {
      if (t.type === "income") totalIncome += t.amount;
      else if (t.type === "expense") totalExpense += t.amount;
    });

    res.json({
      success: true,
      totalCount,
      currentPage,
      totalPages: Math.ceil(totalCount / pageSize),
      totals: {
        totalIncome: Number(totalIncome.toFixed(2)),
        totalExpense: Number(totalExpense.toFixed(2)),
        netSavings: Number((totalIncome - totalExpense).toFixed(2)),
      },
      transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found." });
    }
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
const createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date, paymentMethod, isRecurring, tags, notes } =
      req.body;

    if (!title || amount === undefined || !type || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, amount, type (income/expense), and category are required.",
      });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      title,
      amount: Number(amount),
      type,
      category,
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || "Credit Card",
      isRecurring: Boolean(isRecurring),
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      notes: notes || "",
    });

    res.status(201).json({
      success: true,
      message: "Transaction added successfully!",
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found." });
    }

    const { title, amount, type, category, date, paymentMethod, isRecurring, tags, notes } =
      req.body;

    if (title) transaction.title = title;
    if (amount !== undefined) transaction.amount = Number(amount);
    if (type) transaction.type = type;
    if (category) transaction.category = category;
    if (date) transaction.date = new Date(date);
    if (paymentMethod) transaction.paymentMethod = paymentMethod;
    if (isRecurring !== undefined) transaction.isRecurring = Boolean(isRecurring);
    if (tags !== undefined) {
      transaction.tags = Array.isArray(tags)
        ? tags
        : typeof tags === "string"
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
    }
    if (notes !== undefined) transaction.notes = notes;

    await transaction.save();

    res.json({
      success: true,
      message: "Transaction updated successfully!",
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found." });
    }

    res.json({ success: true, message: "Transaction deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export transactions as CSV
// @route   GET /api/transactions/export/csv
const exportTransactionsCSV = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });

    let csv = "Date,Title,Type,Category,Amount,Payment Method,Recurring,Tags,Notes\n";

    transactions.forEach((t) => {
      const d = new Date(t.date).toISOString().split("T")[0];
      const title = `"${(t.title || "").replace(/"/g, '""')}"`;
      const category = `"${(t.category || "").replace(/"/g, '""')}"`;
      const notes = `"${(t.notes || "").replace(/"/g, '""')}"`;
      const tags = `"${(t.tags || []).join("; ")}"`;
      csv += `${d},${title},${t.type},${category},${t.amount},${t.paymentMethod},${t.isRecurring},${tags},${notes}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="transactions.csv"');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportTransactionsCSV,
};
