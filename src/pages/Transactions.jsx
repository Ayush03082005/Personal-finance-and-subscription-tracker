import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { transactionAPI } from "../services/api";
import AddTransactionModal from "../components/AddTransactionModal";
import {
  ReceiptText,
  Plus,
  Search,
  Download,
  Trash2,
  TrendingUp,
  TrendingDown,
  Filter,
  Calendar,
} from "lucide-react";

export default function Transactions() {
  const { formatAmount } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await transactionAPI.getAll({
        type: typeFilter,
        category: categoryFilter,
        search,
      });
      if (res.data.success) {
        setTransactions(res.data.transactions || []);
        setTotals(res.data.totals || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, categoryFilter, search]);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete transaction "${title}"?`)) {
      try {
        await transactionAPI.delete(id);
        fetchTransactions();
      } catch (err) {
        alert("Failed to delete transaction.");
      }
    }
  };

  const handleExportCSV = () => {
    window.open(transactionAPI.getExportUrl(), "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ReceiptText className="w-6 h-6 text-emerald-400" />
            <span>Transaction Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track daily cash inflow, outflows, recurring expenses, and categorization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Filtered Totals Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">
            Filtered Income
          </span>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">
            +{formatAmount(totals.totalIncome || 0)}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">
            Filtered Expenses
          </span>
          <div className="text-xl font-extrabold text-rose-400 mt-1">
            -{formatAmount(totals.totalExpense || 0)}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">
            Net Cash Flow
          </span>
          <div
            className={`text-xl font-extrabold mt-1 ${
              (totals.netSavings || 0) >= 0 ? "text-indigo-400" : "text-rose-400"
            }`}
          >
            {formatAmount(totals.netSavings || 0)}
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-center gap-1.5">
          {[
            { id: "all", label: "All Records" },
            { id: "income", label: "Income" },
            { id: "expense", label: "Expenses" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                typeFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px] sm:min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search title, category, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center">
            <ReceiptText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No transactions match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Date</th>
                  <th className="pb-3">Title / Details</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pl-2 text-slate-400 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        <span>{tx.title}</span>
                        {tx.isRecurring && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                            Recurring
                          </span>
                        )}
                      </div>
                      {tx.notes && (
                        <div className="text-[11px] text-slate-500 font-normal">{tx.notes}</div>
                      )}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium text-[11px]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{tx.paymentMethod}</td>
                    <td className="py-3 text-right font-extrabold whitespace-nowrap">
                      <span
                        className={tx.type === "income" ? "text-emerald-400" : "text-rose-400"}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatAmount(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <button
                        onClick={() => handleDelete(tx._id, tx.title)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchTransactions}
      />
    </div>
  );
}
