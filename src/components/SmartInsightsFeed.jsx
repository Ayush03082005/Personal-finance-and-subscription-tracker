import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, AlertTriangle, CheckCircle, TrendingDown, BellRing, ArrowRight } from "lucide-react";

export default function SmartInsightsFeed({ insights }) {
  if (!insights || insights.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 text-sm bg-slate-900/50 rounded-2xl border border-slate-800">
        <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-60" />
        No active alerts. Your subscriptions and budgets are currently well-balanced!
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case "urgent":
        return <BellRing className="w-4 h-4 text-rose-400" />;
      case "danger":
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case "warning":
        return <TrendingDown className="w-4 h-4 text-amber-400" />;
      case "positive":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case "urgent":
        return "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50";
      case "danger":
        return "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50";
      case "warning":
        return "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50";
      case "positive":
        return "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50";
      default:
        return "border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500/50";
    }
  };

  return (
    <div className="space-y-3">
      {insights.map((item, idx) => (
        <div
          key={item.id || idx}
          className={`p-4 rounded-xl border transition-all ${getBorderColor(item.type)}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                  {item.impact && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                      {item.impact}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            {item.actionTarget && (
              <Link
                to={`/${item.actionTarget}`}
                className="shrink-0 flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                <span>{item.actionLabel || "Resolve"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
