import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { budgetAPI } from "../services/api";
import { X, PieChart } from "lucide-react";

const CATEGORIES = [
  "Food & Dining",
  "Housing & Rent",
  "Subscriptions",
  "Utilities",
  "Transportation",
  "Shopping",
  "Healthcare",
  "Entertainment",
  "Education",
  "Travel",
  "Personal Care",
  "Other",
];

export default function AddBudgetModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const { currency } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(
    initialData || {
      category: "Food & Dining",
      monthlyLimit: "",
      alertThreshold: 80,
      color: "#6366f1",
    }
  );

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.monthlyLimit) {
      alert("Please provide category and monthly limit.");
      return;
    }

    try {
      setLoading(true);
      if (initialData && initialData._id) {
        await budgetAPI.update(initialData._id, {
          ...formData,
          monthlyLimit: Number(formData.monthlyLimit),
        });
      } else {
        await budgetAPI.create({
          ...formData,
          monthlyLimit: Number(formData.monthlyLimit),
        });
      }
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to save budget: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {initialData ? "Edit Category Budget" : "Set Category Budget"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Monthly Spending Limit ({currency})
            </label>
            <input
              type="number"
              step="1"
              min="1"
              placeholder="e.g. 500"
              required
              value={formData.monthlyLimit}
              onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Alert Warning Threshold ({formData.alertThreshold}%)
            </label>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={formData.alertThreshold}
              onChange={(e) => setFormData({ ...formData, alertThreshold: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>50% (Early warning)</span>
              <span>80% (Recommended)</span>
              <span>95% (Near limit)</span>
            </div>
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
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
