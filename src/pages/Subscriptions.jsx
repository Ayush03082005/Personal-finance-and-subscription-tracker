import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { subscriptionAPI } from "../services/api";
import AddSubscriptionModal from "../components/AddSubscriptionModal";
import {
  CreditCard,
  Plus,
  Search,
  ExternalLink,
  PauseCircle,
  PlayCircle,
  XCircle,
  Trash2,
  Edit2,
  Calendar,
  AlertTriangle,
  Receipt,
  CheckCircle,
} from "lucide-react";

export default function Subscriptions() {
  const { formatAmount } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await subscriptionAPI.getAll({
        status: statusFilter,
        category: categoryFilter,
        search,
      });
      if (res.data.success) {
        setSubscriptions(res.data.subscriptions || []);
        setMetrics(res.data.metrics || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter, categoryFilter, search]);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "paused" : "active";
    try {
      await subscriptionAPI.toggleStatus(id, nextStatus);
      fetchSubscriptions();
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    }
  };

  const handleLogPayment = async (sub) => {
    try {
      await subscriptionAPI.logPayment(sub._id);
      alert(`Recorded payment of ${formatAmount(sub.cost)} for ${sub.name}! Next billing date updated.`);
      fetchSubscriptions();
    } catch (err) {
      alert("Failed to log payment: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete subscription "${name}"?`)) {
      try {
        await subscriptionAPI.delete(id);
        fetchSubscriptions();
      } catch (err) {
        alert("Failed to delete subscription.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-indigo-400" />
            <span>Subscription Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track, audit, and cancel recurring services before they bill you.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingSub(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Subscription Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Monthly Burn</span>
          <div className="text-xl font-extrabold text-white mt-1">
            {formatAmount(metrics.totalMonthlyRecurring || 0)}
          </div>
          <span className="text-[10px] text-slate-500">Every 30 days</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Annualized Load</span>
          <div className="text-xl font-extrabold text-indigo-300 mt-1">
            {formatAmount(metrics.totalYearlyRecurring || 0)}
          </div>
          <span className="text-[10px] text-slate-500">12-month projection</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Active Services</span>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">
            {metrics.activeCount || 0}
          </div>
          <span className="text-[10px] text-emerald-500/80">Currently billing</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Paused Shield</span>
          <div className="text-xl font-extrabold text-amber-400 mt-1">
            {metrics.pausedCount || 0}
          </div>
          <span className="text-[10px] text-amber-400/80">Saving money</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "paused", label: "Paused" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[200px] sm:min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Subscription Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading subscriptions...</div>
      ) : subscriptions.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
          <CreditCard className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">No subscriptions found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Add your recurring streaming, SaaS, gym, and cloud subscriptions to start tracking.
          </p>
          <button
            onClick={() => {
              setEditingSub(null);
              setIsAddModalOpen(true);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Add Your First Subscription
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((sub) => {
            const daysLeft = sub.daysUntilRenewal;
            const isUrgent = daysLeft !== null && daysLeft <= 3 && sub.status === "active";

            return (
              <div
                key={sub._id}
                className={`p-5 rounded-2xl bg-slate-900/80 border transition-all ${
                  isUrgent
                    ? "border-rose-500/40 shadow-lg shadow-rose-500/5"
                    : sub.status === "paused"
                    ? "border-amber-500/30 opacity-75"
                    : "border-slate-800 hover:border-slate-700"
                } flex flex-col justify-between gap-4`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        style={{ backgroundColor: sub.color || "#6366f1" }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md"
                      >
                        {sub.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight">{sub.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {sub.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              sub.status === "active"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : sub.status === "paused"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold text-white">
                        {formatAmount(sub.cost)}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        per {sub.billingCycle}
                      </div>
                    </div>
                  </div>

                  {/* Renewal countdown banner */}
                  <div className="mt-4 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Next Renewal:</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-200">
                        {new Date(sub.nextBillingDate).toLocaleDateString()}
                      </span>
                      {sub.status === "active" && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            isUrgent
                              ? "bg-rose-500/30 text-rose-300 animate-pulse"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {daysLeft === 0 ? "Today" : `${daysLeft}d`}
                        </span>
                      )}
                    </div>
                  </div>

                  {sub.notes && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-1 italic">
                      "{sub.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom Action Controls */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* Direct Cancellation link */}
                    {sub.cancellationUrl ? (
                      <a
                        href={sub.cancellationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                        title="Open account cancellation / manage page"
                      >
                        <span>Cancel Web</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : null}

                    {/* Quick log payment button */}
                    {sub.status === "active" && (
                      <button
                        onClick={() => handleLogPayment(sub)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
                        title="Record payment into transaction ledger"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>Log Paid</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Toggle pause / resume */}
                    <button
                      onClick={() => handleToggleStatus(sub._id, sub.status)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        sub.status === "active"
                          ? "text-slate-400 hover:text-amber-400 hover:bg-amber-500/10"
                          : "text-emerald-400 hover:bg-emerald-500/10"
                      }`}
                      title={sub.status === "active" ? "Pause subscription" : "Resume subscription"}
                    >
                      {sub.status === "active" ? (
                        <PauseCircle className="w-4 h-4" />
                      ) : (
                        <PlayCircle className="w-4 h-4" />
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setEditingSub(sub);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(sub._id, sub.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Subscription Modal */}
      <AddSubscriptionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSub(null);
        }}
        onSuccess={fetchSubscriptions}
        initialData={editingSub}
      />
    </div>
  );
}
