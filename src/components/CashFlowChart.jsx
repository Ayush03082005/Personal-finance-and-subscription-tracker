import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function CashFlowChart({ data }) {
  const { formatAmount } = useAuth();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        No transaction history available yet.
      </div>
    );
  }

  // Calculate maximum value to scale the bars nicely
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.income, d.expense)),
    1000
  );

  const chartHeight = 180;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">Cash Flow Trends</h3>
          <p className="text-xs text-slate-400">Income vs Expenses (Last 6 Months)</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
            <span className="text-slate-300">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span>
            <span className="text-slate-300">Expense</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative pt-6">
        <div className="grid grid-cols-6 gap-2 sm:gap-6 items-end h-[180px] border-b border-slate-800 pb-2">
          {data.map((item, idx) => {
            const incomeHeight = Math.max(8, Math.round((item.income / maxVal) * chartHeight));
            const expenseHeight = Math.max(8, Math.round((item.expense / maxVal) * chartHeight));
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                className="relative flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-16 z-20 bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-xl text-[11px] whitespace-nowrap min-w-[130px] pointer-events-none">
                    <div className="font-bold text-slate-200 mb-1">
                      {item.month} {item.year}
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>In:</span> <span>{formatAmount(item.income)}</span>
                    </div>
                    <div className="flex justify-between text-rose-400">
                      <span>Out:</span> <span>{formatAmount(item.expense)}</span>
                    </div>
                    <div className="flex justify-between text-indigo-400 font-semibold border-t border-slate-800 pt-0.5 mt-0.5">
                      <span>Net:</span> <span>{formatAmount(item.net)}</span>
                    </div>
                  </div>
                )}

                {/* Bars */}
                <div className="w-full flex items-end justify-center gap-1 sm:gap-2">
                  {/* Income Bar */}
                  <div
                    style={{ height: `${incomeHeight}px` }}
                    className={`w-3 sm:w-5 rounded-t transition-all ${
                      isHovered ? "bg-emerald-400" : "bg-emerald-500/80 hover:bg-emerald-400"
                    }`}
                  />
                  {/* Expense Bar */}
                  <div
                    style={{ height: `${expenseHeight}px` }}
                    className={`w-3 sm:w-5 rounded-t transition-all ${
                      isHovered ? "bg-rose-400" : "bg-rose-500/80 hover:bg-rose-400"
                    }`}
                  />
                </div>

                {/* Month label */}
                <span className="text-[11px] font-medium text-slate-400 mt-2">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
