import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { analyticsAPI, demoAPI } from "../services/api";
import {
  Sparkles,
  ShieldCheck,
  TrendingDown,
  Calendar,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Coins,
  CheckCircle,
} from "lucide-react";

export default function SmartAdvisor() {
  const { formatAmount } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState([]);
  const [cashflow, setCashflow] = useState(null);
  const [seeding, setSeeding] = useState(false);

  const fetchAdvisorData = async () => {
    try {
      setLoading(true);
      const [sumRes, insRes, flowRes] = await Promise.all([
        analyticsAPI.getSummary(),
        analyticsAPI.getInsights(),
        analyticsAPI.getCashflow(),
      ]);

      if (sumRes.data.success) setSummary(sumRes.data);
      if (insRes.data.success) setInsights(insRes.data.insights || []);
      if (flowRes.data.success) setCashflow(flowRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisorData();
  }, []);

  const handleResetDemoData = async () => {
    if (window.confirm("Reload comprehensive sample dataset for testing?")) {
      try {
        setSeeding(true);
        await demoAPI.resetData();
        window.location.reload();
      } catch (err) {
        alert("Reset failed: " + err.message);
      } finally {
        setSeeding(false);
      }
    }
  };

  if (loading && !summary) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Analyzing financial patterns & subscriptions...</p>
        </div>
      </div>
    );
  }

  const s = summary?.summary || {};
  const healthScore = s.healthScore || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Automated Financial Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Smart Financial Advisor & Audit
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Algorithmic insights to eliminate subscription waste, optimize cash reserves, and maximize savings rate.
          </p>
        </div>

        <button
          onClick={handleResetDemoData}
          disabled={seeding}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${seeding ? "animate-spin text-indigo-400" : ""}`} />
          <span>{seeding ? "Reloading..." : "Reload Demo Scenario"}</span>
        </button>
      </div>

      {/* Health Score Deep-Dive Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 glass-card">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
          {/* Big Circular Score */}
          <div className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray="289"
                  strokeDashoffset={289 - (289 * healthScore) / 100}
                  className={
                    healthScore >= 80
                      ? "text-emerald-400"
                      : healthScore >= 60
                      ? "text-indigo-400"
                      : "text-amber-400"
                  }
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-3xl font-black text-white">{healthScore}</span>
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-slate-200 block">
                {s.healthGrade} Standing
              </span>
              <span className="text-[11px] text-slate-500">Scale of 0 to 100</span>
            </div>
          </div>

          {/* Pillars Breakdown (3 Columns) */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">
                1. Savings Rate
              </span>
              <div className="text-xl font-extrabold text-emerald-400 mt-1">
                {s.savingsRate}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {s.savingsRate >= 20
                  ? "Exceeds standard 20% benchmark."
                  : "Target saving at least 20% of income."}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">
                2. Subscription Load
              </span>
              <div className="text-xl font-extrabold text-purple-400 mt-1">
                {s.subscriptionExpenseRatio}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {s.subscriptionExpenseRatio <= 15
                  ? "Lean subscription overhead."
                  : "Consider canceling overlapping services."}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">
                3. Annual Subscription Cost
              </span>
              <div className="text-xl font-extrabold text-indigo-300 mt-1">
                {formatAmount(s.annualSubscriptionsCost || 0)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Equivalent to {formatAmount(s.totalMonthlySubscriptions || 0)} per month.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Recommendations List */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">Smart Action Items & Detected Savings</h2>
        </div>

        <div className="space-y-4">
          {insights.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-sm font-bold text-white">{item.title}</span>
                  {item.impact && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.impact}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-3xl">
                  {item.description}
                </p>
              </div>

              {item.actionTarget && (
                <Link
                  to={`/${item.actionTarget}`}
                  className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
                >
                  <span>{item.actionLabel || "Review"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 30-Day Cashflow Deductions Timeline */}
      {cashflow && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glass-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>30-Day Subscription Cashflow Forecast</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upcoming automated charges draining your account over the next month
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase block">Total Expected Drain</span>
              <span className="text-base font-extrabold text-rose-400">
                -{formatAmount(cashflow.totalUpcomingSubscriptionDrain || 0)}
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80">
            {cashflow.scheduledDeductions?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No scheduled charges in the next 30 days.</p>
            ) : (
              cashflow.scheduledDeductions?.map((d) => (
                <div key={d.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                      {d.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{d.name}</div>
                      <div className="text-[11px] text-slate-400">{d.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400">
                      {new Date(d.date).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-extrabold text-rose-400">
                      -{formatAmount(d.amount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
