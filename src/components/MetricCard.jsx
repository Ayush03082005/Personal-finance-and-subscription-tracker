import React from "react";

export default function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendPositive = true,
  badge,
  color = "indigo",
}) {
  const colorMap = {
    indigo: "from-indigo-600/20 to-indigo-900/10 text-indigo-400 border-indigo-500/20",
    emerald: "from-emerald-600/20 to-emerald-900/10 text-emerald-400 border-emerald-500/20",
    rose: "from-rose-600/20 to-rose-900/10 text-rose-400 border-rose-500/20",
    amber: "from-amber-600/20 to-amber-900/10 text-amber-400 border-amber-500/20",
    purple: "from-purple-600/20 to-purple-900/10 text-purple-400 border-purple-500/20",
  };

  const currentTheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="relative p-5 rounded-2xl bg-slate-900/70 border border-slate-800 glass-card-hover overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="text-2xl font-extrabold text-white mt-1.5 tracking-tight">
            {value}
          </div>
        </div>
        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${currentTheme} flex items-center justify-center border`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs">
        {trend && (
          <span
            className={`font-semibold flex items-center gap-0.5 ${
              trendPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {trend}
          </span>
        )}
        {badge && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {badge}
          </span>
        )}
        {subtext && <span className="text-slate-400">{subtext}</span>}
      </div>
    </div>
  );
}
