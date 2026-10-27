import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { goalAPI } from "../services/api";
import { X, PlusCircle } from "lucide-react";

export default function DepositGoalModal({ isOpen, onClose, onSuccess, goal }) {
  const { currency, formatAmount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [logAsTransaction, setLogAsTransaction] = useState(true);

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const depositVal = Number(amount);
    if (!depositVal || depositVal <= 0) {
      alert("Please enter a valid contribution amount.");
      return;
    }

    try {
      setLoading(true);
      await goalAPI.deposit(goal._id, {
        amount: depositVal,
        logAsTransaction,
      });
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      alert("Deposit failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Contribute Funds</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{goal.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex justify-between items-center">
            <span className="text-slate-400">Current Progress:</span>
            <span className="font-bold text-slate-200">
              {formatAmount(goal.currentAmount)} / {formatAmount(goal.targetAmount)} (
              {goal.progressPercentage}%)
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Contribution Amount ({currency})
            </label>
            <input
              type="number"
              step="1"
              min="1"
              placeholder="e.g. 250"
              required
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-base font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="logTx"
              checked={logAsTransaction}
              onChange={(e) => setLogAsTransaction(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-emerald-600 focus:ring-0"
            />
            <label htmlFor="logTx" className="text-xs text-slate-300 cursor-pointer">
              Record as an expense transaction
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Funds"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
