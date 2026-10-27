import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { analyticsAPI, subscriptionAPI, transactionAPI } from "../services/api";
import MetricCard from "../components/MetricCard";
import CashFlowChart from "../components/CashFlowChart";
import CategoryBreakdownChart from "../components/CategoryBreakdownChart";
import SmartInsightsFeed from "../components/SmartInsightsFeed";
import AddTransactionModal from "../components/AddTransactionModal";
import AddSubscriptionModal from "../components/AddSubscriptionModal";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  Sparkles,
  Calendar,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function Dashboard() {
  const { user, formatAmount } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState([]);
  const [upcomingSubs, setUpcomingSubs] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, insRes, upRes, txRes] = await Promise.all([
        analyticsAPI.getSummary(),
        analyticsAPI.getInsights(),
        subscriptionAPI.getUpcoming({ days: 14 }),
        transactionAPI.getAll({ limit: 5 }),
      ]);

      if (sumRes.data.success) setSummary(sumRes.data);
      if (insRes.data.success) setInsights(insRes.data.insights || []);
      if (upRes.data.success) setUpcomingSubs(upRes.data.subscriptions || []);
      if (txRes.data.success) setRecentTransactions(txRes.data.transactions || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickLogPayment = async (subId, subName) => {
    try {
      await subscriptionAPI.logPayment(subId);
      alert(`Recorded payment for ${subName}!`);
      fetchDashboardData();
    } catch (err) {
      alert("Failed to log payment: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading && !summary) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading your smart finances...</p>
        </div>
      </div>
    );
  }

  const s = summary?.summary || {};
  const healthScore = s.healthScore || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome & Smart Financial Health Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/20 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                AI Smart Financial Advisor Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || "Member"}!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Here is your real-time financial pulse. You are saving{" "}
              <span className="font-bold text-emerald-400">{s.savingsRate}%</span> of your income
              this month with <span className="font-bold text-purple-400">{s.activeSubscriptionsCount}</span> active subscriptions.
            </p>
          </div>

          {/* Health Score Pill */}
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray="163"
                  strokeDashoffset={163 - (163 * healthScore) / 100}
                  className={
                    healthScore >= 80
                      ? "text-emerald-500"
                      : healthScore >= 60
                      ? "text-indigo-500"
                      : "text-amber-500"
                  }
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-base font-extrabold text-white">{healthScore}</span>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Health Score
              </div>
              <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{summary?.summary?.healthGrade || "Good"}</span>
              </div>
              <Link
                to="/advisor"
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 mt-1 inline-flex items-center gap-0.5"
              >
                <span>View Full Audit</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monthly Income"
          value={formatAmount(s.monthlyIncome)}
          icon={TrendingUp}
          color="emerald"
          trend="+5.4%"
          trendPositive={true}
          subtext="vs last month"
        />
        <MetricCard
          title="Monthly Expenses"
          value={formatAmount(s.monthlyExpense)}
          icon={TrendingDown}
          color="rose"
          trend="-2.1%"
          trendPositive={true}
          subtext="discretionary down"
        />
        <MetricCard
          title="Net Savings Rate"
          value={`${s.savingsRate}%`}
          icon={PiggyBank}
          color="indigo"
          badge={`${formatAmount(s.netSavings)} saved`}
          subtext="target: 25%"
        />
        <MetricCard
          title="Active Subscriptions"
          value={formatAmount(s.totalMonthlySubscriptions)}
          icon={CreditCard}
          color="purple"
          subtext={`${formatAmount(s.annualSubscriptionsCost)}/yr total`}
          badge={`${s.activeSubscriptionsCount} services`}
        />
      </div>

      {/* Upcoming Renewals in Next 14 Days Banner */}
      {upcomingSubs.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/20 glass-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Upcoming Renewals (Next 14 Days)</h3>
                <p className="text-xs text-slate-400">
                  {upcomingSubs.length} subscriptions scheduled to renew
                </p>
              </div>
            </div>
            <Link
              to="/subscriptions"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>Manage Subscriptions Hub</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {upcomingSubs.slice(0, 3).map((sub) => {
              const daysLeft = sub.daysUntilRenewal;
              const isUrgent = daysLeft !== null && daysLeft <= 3;
              return (
                <div
                  key={sub._id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200 truncate">{sub.name}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isUrgent
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        }`}
                      >
                        {daysLeft === 0 ? "Today" : `${daysLeft}d left`}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-400 mt-1">
                      {formatAmount(sub.cost)} / {sub.billingCycle}
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuickLogPayment(sub._id, sub.name)}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-[11px] font-semibold transition-all"
                    title="Record this payment in transactions and advance renewal date"
                  >
                    Log Paid
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Trends (2 Columns) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card">
          <CashFlowChart data={summary?.monthlyTrends || []} />
        </div>

        {/* Category Breakdown (1 Column) */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100">Monthly Spending</h3>
              <Link to="/budgets" className="text-xs text-indigo-400 hover:underline">
                View Budgets
              </Link>
            </div>
            <CategoryBreakdownChart breakdown={summary?.categoryBreakdown || []} />
          </div>
        </div>
      </div>

      {/* Smart Insights & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Recommendations Feed (1 Column) */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-slate-100">Smart Financial Alerts</h3>
            </div>
            <Link to="/advisor" className="text-xs text-indigo-400 hover:underline">
              Advisor
            </Link>
          </div>
          <SmartInsightsFeed insights={insights} />
        </div>

        {/* Recent Transactions (2 Columns) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">Recent Transactions</h3>
              <p className="text-xs text-slate-400">Latest income and expense entries</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddTxOpen(true)}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Entry</span>
              </button>
              <Link
                to="/transactions"
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
              >
                View All
              </Link>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No recent transactions recorded yet.
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === "income"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {tx.type === "income" ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-200 truncate">{tx.title}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span>{new Date(tx.date).toLocaleDateString()}</span>
                        {tx.isRecurring && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                            Recurring
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`text-sm font-bold shrink-0 ${
                      tx.type === "income" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatAmount(tx.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onSuccess={fetchDashboardData}
      />
      <AddSubscriptionModal
        isOpen={isAddSubOpen}
        onClose={() => setIsAddSubOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
