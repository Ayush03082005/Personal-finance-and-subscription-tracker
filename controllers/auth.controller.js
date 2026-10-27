const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const { seedSampleDataForUser } = require("./demo.controller");

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, currency } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password.",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      currency: currency || "$",
    });

    const token = generateToken(res, user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        monthlyIncomeTarget: user.monthlyIncomeTarget,
        monthlyBudgetLimit: user.monthlyBudgetLimit,
        savingsGoalTarget: user.savingsGoalTarget,
        alertPreferences: user.alertPreferences,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to register.",
    });
  }
};

// @desc    Log in an existing user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email and password.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(res, user._id);

    res.json({
      success: true,
      message: "Logged in successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        monthlyIncomeTarget: user.monthlyIncomeTarget,
        monthlyBudgetLimit: user.monthlyBudgetLimit,
        savingsGoalTarget: user.savingsGoalTarget,
        alertPreferences: user.alertPreferences,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to log in.",
    });
  }
};

// @desc    Instant Demo Login (no password needed, perfect for instant demo/eval)
// @route   POST /api/auth/demo
const demoLogin = async (req, res) => {
  try {
    const demoEmail = "demo@smartfinance.io";
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      user = await User.create({
        name: "Alex Morgan",
        email: demoEmail,
        password: "DemoUserSecurePass2026!",
        currency: "$",
        monthlyIncomeTarget: 6800,
        monthlyBudgetLimit: 3600,
        savingsGoalTarget: 2000,
      });
      await seedSampleDataForUser(user._id);
    }

    const token = generateToken(res, user._id);

    res.json({
      success: true,
      message: "Logged in as Demo User!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        monthlyIncomeTarget: user.monthlyIncomeTarget,
        monthlyBudgetLimit: user.monthlyBudgetLimit,
        savingsGoalTarget: user.savingsGoalTarget,
        alertPreferences: user.alertPreferences,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to log in as demo user.",
    });
  }
};

// @desc    Log out user and clear cookie
// @route   POST /api/auth/logout
const logout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    path: "/",
  });
  res.json({
    success: true,
    message: "Logged out successfully.",
  });
};

// @desc    Get currently logged-in user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile & preferences
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      currency,
      monthlyIncomeTarget,
      monthlyBudgetLimit,
      savingsGoalTarget,
      alertPreferences,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (name) user.name = name;
    if (currency) user.currency = currency;
    if (monthlyIncomeTarget !== undefined) user.monthlyIncomeTarget = Number(monthlyIncomeTarget);
    if (monthlyBudgetLimit !== undefined) user.monthlyBudgetLimit = Number(monthlyBudgetLimit);
    if (savingsGoalTarget !== undefined) user.savingsGoalTarget = Number(savingsGoalTarget);
    if (alertPreferences) {
      user.alertPreferences = { ...user.alertPreferences, ...alertPreferences };
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        monthlyIncomeTarget: user.monthlyIncomeTarget,
        monthlyBudgetLimit: user.monthlyBudgetLimit,
        savingsGoalTarget: user.savingsGoalTarget,
        alertPreferences: user.alertPreferences,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  demoLogin,
  logout,
  getMe,
  updateProfile,
};
