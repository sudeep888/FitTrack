import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Dumbbell, TrendingUp, BarChart3,
  Calculator, Target, Trophy, Settings, Zap, X, ChevronRight
} from "lucide-react";
import { useApp } from "../../context/AppContext";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/workouts", icon: Dumbbell, label: "Workout Log" },
  { to: "/progress", icon: TrendingUp, label: "Progress" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/calculators", icon: Calculator, label: "Calculators" },
  { to: "/goals", icon: Target, label: "Goals" },
  { to: "/records", icon: Trophy, label: "Personal Records" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar({ open, onClose }) {
  const { profile, getStreak } = useApp();
  const streak = getStreak();

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}

      <aside className={`
        fixed top-0 left-0 h-full z-40 w-64 bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800
        flex flex-col transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-sm">FitTrack</span>
              <span className="font-bold text-emerald-600 text-sm"> Pro</span>
            </div>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to} end={to === "/"}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                }
              `}
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
              {profile.name[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{profile.name}</p>
              {streak > 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">🔥 {streak} day streak</p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
