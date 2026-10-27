import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { subscriptionAPI } from "../services/api";
import { X, CreditCard, Sparkles } from "lucide-react";

const SUBSCRIPTION_PRESETS = [
  {
    name: "Netflix Premium",
    cost: "22.99",
    category: "Streaming",
    billingCycle: "monthly",
    color: "#e50914",
    cancellationUrl: "https://www.netflix.com/youraccount",
  },
  {
    name: "Spotify Family",
    cost: "16.99",
    category: "Music",
    billingCycle: "monthly",
    color: "#1db954",
    cancellationUrl: "https://www.spotify.com/account/subscription/",
  },
  {
    name: "ChatGPT Plus",
    cost: "20.00",
    category: "Software & AI",
    billingCycle: "monthly",
    color: "#10a37f",
    cancellationUrl: "https://chatgpt.com/#settings/Subscription",
  },
  {
    name: "Amazon Prime",
    cost: "14.99",
    category: "Streaming",
    billingCycle: "monthly",
    color: "#00a8e1",
    cancellationUrl: "https://www.amazon.com/mc/manage",
  },
  {
    name: "YouTube Premium",
    cost: "13.99",
    category: "Streaming",
    billingCycle: "monthly",
    color: "#ff0000",
    cancellationUrl: "https://www.youtube.com/paid_memberships",
  },
  {
    name: "GitHub Copilot",
    cost: "10.00",
    category: "Software & AI",
    billingCycle: "monthly",
    color: "#6e40c9",
    cancellationUrl: "https://github.com/settings/copilot",
  },
  {
    name: "Gym & Fitness",
    cost: "45.00",
    category: "Fitness",
    billingCycle: "monthly",
    color: "#f59e0b",
    cancellationUrl: "",
  },
  {
    name: "Apple iCloud+",
    cost: "2.99",
    category: "Cloud & Hosting",
    billingCycle: "monthly",
    color: "#0071e3",
    cancellationUrl: "https://support.apple.com/HT207594",
  },
];

export default function AddSubscriptionModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const { currency } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      cost: "",
      billingCycle: "monthly",
      category: "Streaming",
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      reminderDaysBefore: 3,
      paymentMethod: "Credit Card",
      cancellationUrl: "",
      notes: "",
      color: "#6366f1",
      status: "active",
    }
  );

  if (!isOpen) return null;

  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      name: preset.name,
      cost: preset.cost,
      category: preset.category,
      billingCycle: preset.billingCycle,
      color: preset.color,
      cancellationUrl: preset.cancellationUrl || prev.cancellationUrl,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.cost) {
      alert("Please provide subscription name and cost.");
      return;
    }

    try {
      setLoading(true);
      if (initialData && initialData._id) {
        await subscriptionAPI.update(initialData._id, {
          ...formData,
          cost: Number(formData.cost),
        });
      } else {
        await subscriptionAPI.create({
          ...formData,
          cost: Number(formData.cost),
        });
      }
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to save subscription: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {initialData ? "Edit Subscription" : "Add Subscription"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        {!initialData && (
          <div className="px-6 pt-3 pb-1 border-b border-slate-800/60 bg-slate-950/40">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Quick Presets:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {SUBSCRIPTION_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/90 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-700/80 transition-all shrink-0 font-medium"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Name & Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Service / Name
              </label>
              <input
                type="text"
                placeholder="e.g. Netflix, Spotify"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Cost ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="19.99"
                required
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Billing Cycle & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Billing Cycle
              </label>
              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly (Annual)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="Streaming">Streaming</option>
                <option value="Software & AI">Software & AI</option>
                <option value="Cloud & Hosting">Cloud & Hosting</option>
                <option value="Fitness">Fitness</option>
                <option value="Music">Music</option>
                <option value="News & Learning">News & Learning</option>
                <option value="Gaming">Gaming</option>
                <option value="Utilities">Utilities</option>
                <option value="Food & Delivery">Food & Delivery</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Next Billing Date & Reminder Days */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Next Billing / Renewal Date
              </label>
              <input
                type="date"
                required
                value={formData.nextBillingDate}
                onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Alert Days Before Renewal
              </label>
              <select
                value={formData.reminderDaysBefore}
                onChange={(e) =>
                  setFormData({ ...formData, reminderDaysBefore: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value={1}>1 day before</option>
                <option value={2}>2 days before</option>
                <option value={3}>3 days before</option>
                <option value={5}>5 days before</option>
                <option value={7}>7 days before</option>
              </select>
            </div>
          </div>

          {/* Cancellation Direct URL */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Cancellation / Manage Web Link (Optional)
            </label>
            <input
              type="url"
              placeholder="https://service.com/account/cancel"
              value={formData.cancellationUrl}
              onChange={(e) => setFormData({ ...formData, cancellationUrl: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Add direct cancel link so you can cancel unused subscriptions in 1 click!
            </p>
          </div>

          {/* Status & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Payment Method
              </label>
              <input
                type="text"
                placeholder="Credit Card, PayPal, etc."
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Buttons */}
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
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : initialData ? "Update Subscription" : "Save Subscription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
