import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { budgetAPI } from "../services/api";
import AddBudgetModal from "../components/AddBudgetModal";
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  TrendingUp,
} from "lucide-react";

export default function Budgets() {
  const { formatAmount } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await budgetAPI.getAll();
      if (res.data.success) {
        setBudgets(res.data.budgets || []);
        setSummary(res.data.summary || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleDelete = async (id, category) => {
    if (window.confirm(`Delete budget for category "${category}"?`)) {
      try {
        await budgetAPI.delete(id);
        fetchBudgets();
      } catch (err) {
        alert("Failed to delete budget.");
      }
    }
  };

  const overallPercentage = summary.overallPercentage || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <PieChart className="w-6 h-6 text-amber-400" />
            <span>Budgets & Spending Ceilings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enforce spending limits per category and receive proactive warnings before overrunning.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Overall Budget Progress Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 glass-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Monthly Budget Health
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {formatAmount(summary.totalSpent || 0)} / {formatAmount(summary.totalBudgeted || 0)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                overallPercentage > 100
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : overallPercentage >= 80
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {overallPercentage}% Utilized
            </span>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Remaining</span>
              <span className="text-sm font-bold text-slate-200">
                {formatAmount(summary.totalRemaining || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            className={`h-full rounded-full transition-all duration-500 ${
              overallPercentage > 100
                ? "bg-rose-500"
                : overallPercentage >= 80
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
          />
        </div>
      </div>

      {/* Category Budgets Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading budgets...</div>
      ) : budgets.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
          <PieChart className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">No category budgets defined</h3>
          <p className="text-xs text-slate-500 mt-1">
            Create limits for Food & Dining, Subscriptions, Rent, and Utilities to prevent overspending.
          </p>
          <button
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
          >
            Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const isExceeded = b.status === "exceeded";
            const isWarning = b.status === "warning";

            return (
              <div
                key={b._id}
                className={`p-5 rounded-2xl bg-slate-900/80 border transition-all ${
                  isExceeded
                    ? "border-rose-500/50 shadow-lg shadow-rose-500/5"
                    : isWarning
                    ? "border-amber-500/40"
                    : "border-slate-800 hover:border-slate-700"
                } flex flex-col justify-between gap-4`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{b.category}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        {isExceeded ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Exceeded by {formatAmount(Math.abs(b.remaining))}
                          </span>
                        ) : isWarning ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Near Limit ({b.percentage}%)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            On Track ({b.percentage}%)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingBudget(b);
                          setIsModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                        title="Edit limit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b._id, b.category)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Numbers */}
                  <div className="flex items-baseline justify-between mt-4">
                    <div>
                      <span className="text-lg font-extrabold text-white">
                        {formatAmount(b.spent)}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">
                        spent of {formatAmount(b.monthlyLimit)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">
                      {formatAmount(b.remaining)} left
                    </span>
                  </div>

                  {/* Progress Meter */}
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden mt-2 p-0.5 border border-slate-800/80">
                    <div
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExceeded ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      <AddBudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSuccess={fetchBudgets}
        initialData={editingBudget}
      />
    </div>
  );
}
