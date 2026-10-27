const Subscription = require("../models/subscription.model");
const Transaction = require("../models/transaction.model");
const Budget = require("../models/budget.model");
const Goal = require("../models/goal.model");

const seedSampleDataForUser = async (userId) => {
  // Clear any existing user data
  await Promise.all([
    Subscription.deleteMany({ userId }),
    Transaction.deleteMany({ userId }),
    Budget.deleteMany({ userId }),
    Goal.deleteMany({ userId }),
  ]);

  const now = new Date();

  // Helper date generators
  const daysFromNow = (d) => {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    return date;
  };
  const daysAgo = (d) => {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    return date;
  };

  // 1. Seed Subscriptions
  const sampleSubscriptions = [
    {
      userId,
      name: "Netflix Premium",
      cost: 22.99,
      billingCycle: "monthly",
      category: "Streaming",
      startDate: daysAgo(180),
      nextBillingDate: daysFromNow(3), // Renews in 3 days!
      status: "active",
      autoRenew: true,
      reminderDaysBefore: 3,
      paymentMethod: "Credit Card",
      cancellationUrl: "https://www.netflix.com/youraccount",
      websiteUrl: "https://www.netflix.com",
      notes: "4K UHD Family plan, shared with household.",
      color: "#e50914",
    },
    {
      userId,
      name: "ChatGPT Plus",
      cost: 20.0,
      billingCycle: "monthly",
      category: "Software & AI",
      startDate: daysAgo(90),
      nextBillingDate: daysFromNow(6),
      status: "active",
      autoRenew: true,
      reminderDaysBefore: 3,
      paymentMethod: "Credit Card",
      cancellationUrl: "https://chatgpt.com/#settings/Subscription",
      websiteUrl: "https://chatgpt.com",
      notes: "Used daily for coding, brainstorming and research.",
      color: "#10a37f",
    },
    {
      userId,
      name: "Spotify Family",
      cost: 16.99,
      billingCycle: "monthly",
      category: "Music",
      startDate: daysAgo(365),
      nextBillingDate: daysFromNow(11),
      status: "active",
      autoRenew: true,
      reminderDaysBefore: 2,
      paymentMethod: "PayPal",
      cancellationUrl: "https://www.spotify.com/account/subscription/",
      websiteUrl: "https://www.spotify.com",
      notes: "Family plan with 5 slots.",
      color: "#1db954",
    },
    {
      userId,
      name: "Amazon Prime",
      cost: 14.99,
      billingCycle: "monthly",
      category: "Streaming",
      startDate: daysAgo(240),
      nextBillingDate: daysFromNow(18),
      status: "active",
      autoRenew: true,
      reminderDaysBefore: 5,
      paymentMethod: "Credit Card",
      cancellationUrl: "https://www.amazon.com/mc/manage",
      websiteUrl: "https://www.amazon.com/prime",
      notes: "Free 2-day delivery + Prime Video streaming.",
      color: "#00a8e1",
    },
    {
      userId,
      name: "GitHub Copilot",
      cost: 10.0,
      billingCycle: "monthly",
      category: "Software & AI",
      startDate: daysAgo(120),
      nextBillingDate: daysFromNow(22),
      status: "active",
      autoRenew: true,
      reminderDaysBefore: 3,
      paymentMethod: "Credit Card",
      cancellationUrl: "https://github.com/settings/copilot",
      websiteUrl: "https://github.com/features/copilot",
      notes: "AI pair programming assistant.",
      color: "#24292e",
    },
    {
      userId,
      name: "Equinox & Fitness Club",
      cost: 49.0,
      billingCycle: "monthly",
      category: "Fitness",
      startDate: daysAgo(60),
      nextBillingDate: daysFromNow(9),
      status: "active",
      autoRenew: true,
      reminderDaysBefore: 4,
      paymentMethod: "Debit Card",
      cancellationUrl: "https://gymportal.example.com/cancel",
      websiteUrl: "https://gymportal.example.com",
      notes: "Includes pool and sauna access.",
      color: "#f59e0b",
    },
    {
      userId,
      name: "Google One (2TB Cloud)",
      cost: 99.99,
      billingCycle: "yearly",
      category: "Cloud & Hosting",
      startDate: daysAgo(200),
      nextBillingDate: daysFromNow(165),
      status: "active",
      autoRenew: true,
      reminderDaysBefore: 14,
      paymentMethod: "Credit Card",
      cancellationUrl: "https://one.google.com/settings",
      websiteUrl: "https://one.google.com",
      notes: "Shared Drive for 4K video backups and Google Photos.",
      color: "#4285f4",
    },
    {
      userId,
      name: "Disney+ Bundle",
      cost: 14.99,
      billingCycle: "monthly",
      category: "Streaming",
      startDate: daysAgo(150),
      nextBillingDate: daysFromNow(20),
      status: "paused", // Redundant with Netflix/Amazon
      autoRenew: false,
      reminderDaysBefore: 3,
      paymentMethod: "Credit Card",
      cancellationUrl: "https://www.disneyplus.com/account",
      websiteUrl: "https://www.disneyplus.com",
      notes: "Paused for 2 months to cut down on unused streaming services.",
      color: "#0a192f",
    },
  ];

  const createdSubs = await Subscription.insertMany(sampleSubscriptions);

  // Map subscriptions to IDs for transactions
  const netflixSub = createdSubs.find((s) => s.name === "Netflix Premium");
  const spotifySub = createdSubs.find((s) => s.name === "Spotify Family");
  const gptSub = createdSubs.find((s) => s.name === "ChatGPT Plus");

  // 2. Seed Transactions
  const sampleTransactions = [
    // Incomes
    {
      userId,
      title: "Senior Tech Consultant Salary",
      amount: 5400.0,
      type: "income",
      category: "Salary",
      date: daysAgo(2),
      paymentMethod: "Bank Transfer",
      isRecurring: true,
      tags: ["Primary Income", "Bi-Weekly"],
      notes: "Direct deposit from Acme Corp payroll.",
    },
    {
      userId,
      title: "Full-Stack Web Development Freelance",
      amount: 1450.0,
      type: "income",
      category: "Freelance",
      date: daysAgo(12),
      paymentMethod: "Bank Transfer",
      isRecurring: false,
      tags: ["Side Hustle", "Client Project"],
      notes: "React & Node dashboard milestone payment.",
    },
    {
      userId,
      title: "S&P 500 Index Dividend Payout",
      amount: 185.5,
      type: "income",
      category: "Investments",
      date: daysAgo(18),
      paymentMethod: "Bank Transfer",
      isRecurring: false,
      tags: ["Passive Income"],
      notes: "Quarterly dividend reinvestment.",
    },

    // Expenses
    {
      userId,
      title: "Modern Apartment Rent",
      amount: 1650.0,
      type: "expense",
      category: "Housing & Rent",
      date: daysAgo(3),
      paymentMethod: "Bank Transfer",
      isRecurring: true,
      tags: ["Living", "Fixed"],
      notes: "Monthly residential lease.",
    },
    {
      userId,
      title: "Whole Foods Organic Groceries",
      amount: 178.4,
      type: "expense",
      category: "Food & Dining",
      date: daysAgo(1),
      paymentMethod: "Credit Card",
      isRecurring: false,
      tags: ["Groceries", "Household"],
      notes: "Weekly pantry and fresh produce restock.",
    },
    {
      userId,
      title: "Trader Joe's Essentials & Snacks",
      amount: 86.25,
      type: "expense",
      category: "Food & Dining",
      date: daysAgo(7),
      paymentMethod: "Credit Card",
      isRecurring: false,
      tags: ["Groceries"],
      notes: "Snacks, frozen items and dried fruits.",
    },
    {
      userId,
      title: "Artisanal Italian Dinner & Wine",
      amount: 94.5,
      type: "expense",
      category: "Food & Dining",
      date: daysAgo(5),
      paymentMethod: "Credit Card",
      isRecurring: false,
      tags: ["Dining Out", "Weekend"],
      notes: "Dinner with friends at Osteria.",
    },
    {
      userId,
      title: "City Power & Natural Gas Utility",
      amount: 135.2,
      type: "expense",
      category: "Utilities",
      date: daysAgo(10),
      paymentMethod: "Bank Transfer",
      isRecurring: true,
      tags: ["Utilities"],
      notes: "Monthly energy bill.",
    },
    {
      userId,
      title: "Gigabit Fiber Internet Connection",
      amount: 79.99,
      type: "expense",
      category: "Utilities",
      date: daysAgo(14),
      paymentMethod: "Credit Card",
      isRecurring: true,
      tags: ["Internet", "Work From Home"],
      notes: "1000Mbps symmetrical fiber.",
    },
    {
      userId,
      title: "Uber Rides to Airport & Downtown",
      amount: 48.75,
      type: "expense",
      category: "Transportation",
      date: daysAgo(9),
      paymentMethod: "Credit Card",
      isRecurring: false,
      tags: ["Transit"],
      notes: "Ride to client meeting.",
    },
    {
      userId,
      title: "Mechanical Wireless Keyboard & Keycaps",
      amount: 139.0,
      type: "expense",
      category: "Shopping",
      date: daysAgo(15),
      paymentMethod: "Credit Card",
      isRecurring: false,
      tags: ["Electronics", "Productivity"],
      notes: "Desk setup upgrade.",
    },
    {
      userId,
      title: "Specialty Espresso Beans & Chemex Filters",
      amount: 32.0,
      type: "expense",
      category: "Food & Dining",
      date: daysAgo(8),
      paymentMethod: "Debit Card",
      isRecurring: false,
      tags: ["Coffee"],
      notes: "Single origin Ethiopian roast.",
    },
    {
      userId,
      title: "Pharmacy & Preventive Health Supplements",
      amount: 45.6,
      type: "expense",
      category: "Healthcare",
      date: daysAgo(16),
      paymentMethod: "Credit Card",
      isRecurring: false,
      tags: ["Health", "Wellness"],
      notes: "Vitamin D3, Omega 3, and electrolytes.",
    },

    // Subscription Renewal Transactions (Recurring)
    {
      userId,
      title: "Netflix Premium Renewal",
      amount: 22.99,
      type: "expense",
      category: "Subscriptions",
      date: daysAgo(27),
      paymentMethod: "Credit Card",
      isRecurring: true,
      subscriptionId: netflixSub ? netflixSub._id : null,
      tags: ["Streaming", "Recurring"],
      notes: "Automatic monthly subscription fee.",
    },
    {
      userId,
      title: "Spotify Family Subscription Renewal",
      amount: 16.99,
      type: "expense",
      category: "Subscriptions",
      date: daysAgo(19),
      paymentMethod: "PayPal",
      isRecurring: true,
      subscriptionId: spotifySub ? spotifySub._id : null,
      tags: ["Music", "Recurring"],
      notes: "Automatic monthly subscription fee.",
    },
    {
      userId,
      title: "ChatGPT Plus AI Assistant Renewal",
      amount: 20.0,
      type: "expense",
      category: "Subscriptions",
      date: daysAgo(24),
      paymentMethod: "Credit Card",
      isRecurring: true,
      subscriptionId: gptSub ? gptSub._id : null,
      tags: ["Software & AI", "Recurring"],
      notes: "Monthly OpenAI subscription.",
    },
  ];

  await Transaction.insertMany(sampleTransactions);

  // 3. Seed Budgets
  const sampleBudgets = [
    {
      userId,
      category: "Food & Dining",
      monthlyLimit: 600,
      alertThreshold: 80,
      color: "#f59e0b",
    },
    {
      userId,
      category: "Housing & Rent",
      monthlyLimit: 1700,
      alertThreshold: 90,
      color: "#6366f1",
    },
    {
      userId,
      category: "Subscriptions",
      monthlyLimit: 150,
      alertThreshold: 80,
      color: "#ec4899",
    },
    {
      userId,
      category: "Utilities",
      monthlyLimit: 250,
      alertThreshold: 80,
      color: "#06b6d4",
    },
    {
      userId,
      category: "Transportation",
      monthlyLimit: 180,
      alertThreshold: 80,
      color: "#8b5cf6",
    },
    {
      userId,
      category: "Shopping",
      monthlyLimit: 300,
      alertThreshold: 75,
      color: "#10b981",
    },
  ];

  await Budget.insertMany(sampleBudgets);

  // 4. Seed Goals
  const sampleGoals = [
    {
      userId,
      title: "6-Month Emergency Fund",
      targetAmount: 12000,
      currentAmount: 8650,
      targetDate: daysFromNow(150),
      category: "Emergency Fund",
      color: "#10b981",
      status: "in-progress",
      notes: "High-yield savings account reserve for peace of mind.",
    },
    {
      userId,
      title: "Kyoto & Tokyo Autumn Trip",
      targetAmount: 4500,
      currentAmount: 3100,
      targetDate: daysFromNow(210),
      category: "Vacation",
      color: "#f43f5e",
      status: "in-progress",
      notes: "Flights, Ryokan stays, culinary tours, and bullet train passes.",
    },
    {
      userId,
      title: "Apple M4 Max Studio Setup",
      targetAmount: 2600,
      currentAmount: 2150,
      targetDate: daysFromNow(45),
      category: "Gadget & Tech",
      color: "#6366f1",
      status: "in-progress",
      notes: "Upgraded workstation for software development & AI models.",
    },
  ];

  await Goal.insertMany(sampleGoals);

  return { success: true, message: "Sample finance data generated successfully!" };
};

// Route handler for explicitly resetting / seeding demo data
const resetDemoData = async (req, res) => {
  try {
    const result = await seedSampleDataForUser(req.user._id);
    res.json({
      success: true,
      message: "Data has been populated with realistic financial & subscription records!",
      result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  seedSampleDataForUser,
  resetDemoData,
};
