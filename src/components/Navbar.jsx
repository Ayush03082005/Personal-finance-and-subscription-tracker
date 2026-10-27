import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { demoAPI } from "../services/api";
import {
  LayoutDashboard,
  CreditCard,
  ReceiptText,
  PieChart,
  Target,
  Sparkles,
  Plus,
  LogOut,
  RefreshCw,
  Coins,
  ChevronDown,
} from "lucide-react";

export default function Navbar({ onOpenAddTx, onOpenAddSub }) {
  const { user, logout, currency, updateProfile } = useAuth();
  const location = useLocation();
  const [seeding, setSeeding] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  const handleResetDemoData = async () => {
    if (window.confirm("Reload demo transactions, subscriptions, and budgets?")) {
      try {
        setSeeding(true);
        await demoAPI.resetData();
        window.location.reload();
      } catch (err) {
        alert("Failed to reload demo data: " + (err.response?.data?.message || err.message));
      } finally {
        setSeeding(false);
      }
    }
  };

  const handleCurrencyChange = async (newCurr) => {
    try {
      await updateProfile({ currency: newCurr });
      setShowCurrencyMenu(false);
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/subscriptions", label: "Subscriptions", icon: CreditCard },
    { to: "/transactions", label: "Transactions", icon: ReceiptText },
    { to: "/budgets", label: "Budgets", icon: PieChart },
    { to: "/goals", label: "Goals", icon: Target },
    { to: "/advisor", label: "Smart Advisor", icon: Sparkles, badge: "AI" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  FinSmart
                </span>
                <span className="hidden sm:inline-block ml-1.5 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Tracker
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-750 transition-colors"
                title="Change Currency"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showCurrencyMenu && (
                <div className="absolute right-0 mt-2 w-28 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50">
                  {["$", "€", "£", "₹", "¥", "C$"].map((curr) => (
                    <button
                      key={curr}
                      onClick={() => handleCurrencyChange(curr)}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                        currency === curr ? "text-indigo-400 font-bold" : "text-slate-300"
                      }`}
                    >
                      <span>{curr}</span>
                      {currency === curr && <span className="text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reload Demo Data */}
            <button
              onClick={handleResetDemoData}
              disabled={seeding}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Reset Sample Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? "animate-spin text-indigo-400" : ""}`} />
              <span>{seeding ? "Resetting..." : "Demo Data"}</span>
            </button>

            {/* Quick Add Button */}
            <div className="relative">
              <button
                onClick={() => setShowQuickMenu(!showQuickMenu)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:shadow-indigo-500/40"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Add</span>
                <ChevronDown className="w-3 h-3 opacity-80" />
              </button>

              {showQuickMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 divide-y divide-slate-800">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowQuickMenu(false);
                        onOpenAddTx && onOpenAddTx();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 flex items-center gap-2"
                    >
                      <ReceiptText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>New Transaction</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowQuickMenu(false);
                        onOpenAddSub && onOpenAddSub();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 flex items-center gap-2"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                      <span>New Subscription</span>
                    </button>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/budgets"
                      onClick={() => setShowQuickMenu(false)}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 flex items-center gap-2"
                    >
                      <PieChart className="w-3.5 h-3.5 text-amber-400" />
                      <span>Set Category Budget</span>
                    </Link>
                    <Link
                      to="/goals"
                      onClick={() => setShowQuickMenu(false)}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 flex items-center gap-2"
                    >
                      <Target className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Create Goal</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-slate-200 leading-tight">
                  {user?.name || "User"}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {user?.email}
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 overflow-x-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${
                  isActive ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
