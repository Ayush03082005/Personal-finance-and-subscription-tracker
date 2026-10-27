require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const { MongoMemoryServer } = require("mongodb-memory-server");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const subscriptionRoutes = require("./routes/subscription.routes");
const transactionRoutes = require("./routes/transaction.routes");
const budgetRoutes = require("./routes/budget.routes");
const goalRoutes = require("./routes/goal.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const demoRoutes = require("./routes/demo.routes");

const User = require("./models/user.model");
const { seedSampleDataForUser } = require("./controllers/demo.controller");

const app = express();

// ── Production CORS ──────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://personal-finance-tracker-lovat-one-98.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Database Connection Cache (For Vercel Serverless) ───────────────────────
let isConnected = false;

async function seedDefaultUserIfEmpty() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("🌱  Seeding initial Demo User with sample finance data...");
      const demoUser = await User.create({
        name: "Alex Morgan",
        email: "demo@smartfinance.io",
        password: "DemoUserSecurePass2026!",
        currency: "$",
        monthlyIncomeTarget: 6800,
        monthlyBudgetLimit: 3600,
        savingsGoalTarget: 2000,
      });
      await seedSampleDataForUser(demoUser._id);
      console.log("✅  Seeded Demo User (demo@smartfinance.io).");
    }
  } catch (err) {
    console.warn("⚠️  Could not seed initial user:", err.message);
  }
}

async function connectToDatabase() {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }
  const mongoUri =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_finance";
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    isConnected = true;
    console.log("✅  Connected to MongoDB Atlas Cloud Server");
    await seedDefaultUserIfEmpty();
  } catch (err) {
    console.error("❌  Database connection error:", err.message);
  }
}

// Ensure DB is connected for API requests
app.use(async (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/health")) {
    await connectToDatabase();
  }
  next();
});

// ── Health Check Routes ─────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Smart Personal Finance & Subscription Tracker API is running 💰",
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/demo", demoRoutes);

// ── Static Frontend Serving & SPA Fallback (for non-Vercel environments) ────
const distPath = path.join(__dirname, "dist");
const hasDist = fs.existsSync(distPath);

if (hasDist && !process.env.VERCEL) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(distPath, "index.html"));
    }
    next();
  });
}

// 404 handler for API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ success: false, message: "API route not found" });
  }
  next();
});

// ── Standalone Server Startup (Local / Dedicated Server) ────────────────────
const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectToDatabase();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀  Smart Finance & Subscription Tracker running on http://127.0.0.1:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error("❌  Startup error:", err.message);
  });
}

module.exports = app;
