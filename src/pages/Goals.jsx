import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { goalAPI } from "../services/api";
import AddGoalModal from "../components/AddGoalModal";
import DepositGoalModal from "../components/DepositGoalModal";
import {
  Target,
  Plus,
  PlusCircle,
  Calendar,
  CheckCircle,
  Trash2,
  Sparkles,
} from "lucide-react";

export default function Goals() {
  const { formatAmount } = useAuth();
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await goalAPI.getAll();
      if (res.data.success) {
        setGoals(res.data.goals || []);
        setSummary(res.data.summary || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete goal "${title}"?`)) {
      try {
        await goalAPI.delete(id);
        fetchGoals();
      } catch (err) {
        alert("Failed to delete goal.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Target className="w-6 h-6 text-emerald-400" />
            <span>Financial Goals & Reserves</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build emergency cushions, save for dream trips, and fund life milestones.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">
            Total Goal Reserves
          </span>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">
            {formatAmount(summary.totalSaved || 0)}
          </div>
          <span className="text-[10px] text-slate-500">
            Across {summary.totalGoals || 0} active goals
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Target</span>
          <div className="text-xl font-extrabold text-white mt-1">
            {formatAmount(summary.totalTarget || 0)}
          </div>
          <span className="text-[10px] text-slate-500">Cumulative financial target</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">
            Overall Completion
          </span>
          <div className="text-xl font-extrabold text-indigo-300 mt-1">
            {summary.overallPercentage || 0}%
          </div>
          <span className="text-[10px] text-slate-500">Milestone velocity</span>
        </div>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
          <Target className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">No active financial goals yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Create an Emergency Fund, Travel Fund, or Major Purchase goal to start tracking progress.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const isCompleted = g.status === "achieved" || g.progressPercentage >= 100;

            return (
              <div
                key={g._id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-5 glass-card"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {g.category}
                      </span>
                      <h3 className="text-base font-bold text-white mt-2">{g.title}</h3>
                    </div>
                    <button
                      onClick={() => handleDelete(g._id, g.title)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Amounts */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-white">
                        {formatAmount(g.currentAmount)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1.5">
                        of {formatAmount(g.targetAmount)}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-indigo-500/20 text-indigo-300"
                      }`}
                    >
                      {g.progressPercentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden mt-2 p-0.5 border border-slate-800">
                    <div
                      style={{ width: `${Math.min(g.progressPercentage, 100)}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? "bg-emerald-400" : "bg-gradient-to-r from-indigo-500 to-emerald-400"
                      }`}
                    />
                  </div>

                  {/* Timeline Details */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(g.targetDate).toLocaleDateString()}</span>
                    </div>
                    <span>{g.daysLeft > 0 ? `${g.daysLeft} days remaining` : "Target date reached"}</span>
                  </div>

                  {g.notes && (
                    <p className="text-xs text-slate-400 mt-2 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                      "{g.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom Action */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  {isCompleted ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Goal Target Achieved!</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Need {formatAmount(g.remainingAmount)} more
                    </span>
                  )}

                  <button
                    onClick={() => setDepositGoal(g)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Contribute</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchGoals}
      />

      <DepositGoalModal
        isOpen={Boolean(depositGoal)}
        onClose={() => setDepositGoal(null)}
        onSuccess={fetchGoals}
        goal={depositGoal}
      />
    </div>
  );
}
