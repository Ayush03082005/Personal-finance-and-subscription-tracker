require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const { MongoMemoryServer } = require("mongodb-memory-server");

const authRoutes = require("./routes/auth.routes");
const subscriptionRoutes = require("./routes/subscription.routes");
const transactionRoutes = require("./routes/transaction.routes");
const budgetRoutes = require("./routes/budget.routes");
const goalRoutes = require("./routes/goal.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const demoRoutes = require("./routes/demo.routes");

const User = require("./models/user.model");
const { seedSampleDataForUser } = require("./controllers/demo.controller");

const cors = require("cors");

const app = express();

// ── Production CORS ──────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
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

// ── Static Frontend Serving & SPA Fallback ──────────────────────────────────
const distPath = path.join(__dirname, "dist");
const hasDist = fs.existsSync(distPath);

if (hasDist) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(distPath, "index.html"));
    }
    next();
  });
} else {
  app.get("/", (req, res) => {
    res.json({
      message: "Smart Personal Finance & Subscription Tracker API is online 🚀",
      docs: "/api/health",
    });
  });
}

// 404 handler for API routes (Express 5 safe)
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ success: false, message: "API route not found" });
  }
  next();
});

// ── Database Connection & Server Startup ────────────────────────────────────
const PORT = process.env.PORT || 3000;

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

async function startServer() {
  let mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_finance";

  try {
    console.log("🔄  Connecting to MongoDB Atlas Cloud Server...");
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log("✅  Connected to MongoDB Atlas Cloud Server (cluster1.ybeht3t.mongodb.net)");
  } catch (err) {
    console.log(`⚠️  Could not connect to external MongoDB (${err.message}). Starting in-memory MongoDB...`);
    const memoryServer = await MongoMemoryServer.create();
    mongoUri = memoryServer.getUri();
    await mongoose.connect(mongoUri);
    console.log("✅  Connected to in-memory MongoDB");
  }

  await seedDefaultUserIfEmpty();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀  Smart Finance & Subscription Tracker running on http://127.0.0.1:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("❌  Startup error:", err.message);
  process.exit(1);
});
