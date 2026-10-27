import React from "react";
import { useAuth } from "../context/AuthContext";

const CATEGORY_COLORS = {
  "Food & Dining": "bg-amber-500 text-amber-300",
  "Housing & Rent": "bg-indigo-500 text-indigo-300",
  Subscriptions: "bg-purple-500 text-purple-300",
  Utilities: "bg-cyan-500 text-cyan-300",
  Transportation: "bg-blue-500 text-blue-300",
  Shopping: "bg-emerald-500 text-emerald-300",
  Healthcare: "bg-rose-500 text-rose-300",
  Entertainment: "bg-pink-500 text-pink-300",
  Education: "bg-yellow-500 text-yellow-300",
  Other: "bg-slate-500 text-slate-300",
};

const BAR_COLORS = [
  "bg-indigo-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-pink-500",
];

export default function CategoryBreakdownChart({ breakdown }) {
  const { formatAmount } = useAuth();

  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
        No expense transactions recorded this month.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Visual multi-segment bar */}
      <div className="h-3 w-full bg-slate-800 rounded-full flex overflow-hidden gap-0.5">
        {breakdown.slice(0, 6).map((item, idx) => (
          <div
            key={idx}
            style={{ width: `${Math.max(item.percentage, 3)}%` }}
            className={`${BAR_COLORS[idx % BAR_COLORS.length]} transition-all`}
            title={`${item.category}: ${item.percentage}%`}
          />
        ))}
      </div>

      {/* Category List */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {breakdown.map((item, idx) => {
          const colorClass = BAR_COLORS[idx % BAR_COLORS.length];
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors text-xs"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                <span className="font-medium text-slate-200">{item.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-100">{formatAmount(item.amount)}</span>
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  {item.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
