# 💰 Smart Personal Finance & Subscription Tracker

A full-stack, intelligent personal finance management and subscription optimization platform built with **MongoDB**, **Express.js**, **React 19**, **Tailwind CSS**, and **Node.js**.

---

## 🌟 Key Features

### 1. 💳 Intelligent Subscription Hub
- **Recurring Cost Tracking**: Real-time monthly burn rate and 12-month annualized projection.
- **Renewal Alert Countdown**: Automatic warnings for subscriptions renewing in 3, 7, or 14 days.
- **Direct 1-Click Cancellation Links**: Jump straight to account management/cancellation portals (Netflix, Spotify, ChatGPT, Apple, Prime, etc.) to cancel unwanted services before billing occurs.
- **Subscription Shielding**: 1-click pause/resume toggle with estimated annual savings tracking.
- **1-Click Renewal Logging**: Automatically record recurring subscription fees into your transaction ledger and advance the next billing date.

### 2. 🤖 Smart Financial Advisor & AI-style Insights
- **Financial Health Score (0-100)**: Evaluates savings rate, budget discipline, subscription-to-expense ratio, and goal progress.
- **Subscription Redundancy Detector**: Flags overlapping services (e.g., multiple streaming platforms, duplicate AI assistants) and calculates potential annual savings.
- **30-Day Cash Flow Forecasting**: Projections of upcoming automated subscription charges draining your bank account.
- **Annual Billing Optimization**: Recommendations for switching high-frequency monthly services to discounted annual plans.

### 3. 📊 Interactive Cash Flow & Category Analytics
- **Interactive Trends**: 6-month historical income vs. expense comparison with net savings margins.
- **Expense Distribution**: Visual multi-segment distribution across Food & Dining, Rent, Utilities, Subscriptions, and more.

### 4. 🎯 Budgets & Spending Ceilings
- **Category Budgets**: Set monthly limits per category with customizable alert thresholds (e.g., warn at 80%).
- **Visual Progress Meters**: Safe (Green), Caution (Yellow), and Exceeded (Red) indicators with real-time remaining calculations.

### 5. 🏆 Savings & Milestone Goals
- **Goal Reserves**: Emergency Fund, vacations, tech gear, downpayments, and debt payoff tracking.
- **1-Click Contribution Modal**: Easily add funds to goals with optional automatic ledger logging.

### 6. 🧾 Transaction Ledger
- Search, filter by Income/Expense and Category, date filtering, and CSV export.

---

## 🛠️ Tech Stack & Architecture

- **Database**: MongoDB (Mongoose schemas with virtuals and indices)
- **Automatic Fallback**: Connects to MongoDB Atlas / Local MongoDB, with zero-config auto-fallback to `mongodb-memory-server` if remote connections are unavailable.
- **Backend**: Node.js & Express 5 (REST API, JWT authentication, cookie parser, bcrypt)
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React icons
- **Instant Demo**: 1-Click Demo Login (`demo@smartfinance.io`) with pre-seeded realistic data.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
Runs both the backend API and Vite client concurrently:
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`

### 3. Run Production Build
```bash
npm run build
npm start
```
The Express server on `http://localhost:3000` serves the built frontend application.

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/demo` - 1-Click instant demo login
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Current user profile
- `PUT /api/auth/profile` - Update currency, income targets, and preferences

### Subscriptions
- `GET /api/subscriptions` - List subscriptions with filters (status, category, search)
- `GET /api/subscriptions/upcoming` - Upcoming renewals within specified days
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id` - Update subscription details
- `PATCH /api/subscriptions/:id/status` - Toggle status (`active`, `paused`, `cancelled`)
- `POST /api/subscriptions/:id/log-payment` - Record payment in ledger and advance renewal date
- `DELETE /api/subscriptions/:id` - Delete subscription

### Transactions
- `GET /api/transactions` - Filtered transactions list
- `POST /api/transactions` - Add income or expense transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/export/csv` - Download CSV export

### Budgets & Ceilings
- `GET /api/budgets` - Category budgets with actual current-month spending
- `POST /api/budgets` - Set category budget limit
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Goals & Reserves
- `GET /api/goals` - List financial goals
- `POST /api/goals` - Create goal
- `POST /api/goals/:id/deposit` - Contribute funds to a goal
- `DELETE /api/goals/:id` - Delete goal

### Analytics & Smart Engine
- `GET /api/analytics/summary` - High-level metrics, savings rate, health score, category breakdown
- `GET /api/analytics/insights` - Algorithmic subscription audit and redundancy warnings
- `GET /api/analytics/cashflow` - 30-day forecast of recurring charges
- `POST /api/demo/reset` - Reload sample financial dataset
