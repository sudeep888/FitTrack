import { Menu, Moon, Sun, Bell } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useLocation } from "react-router-dom";

const titles = {
  "/": "Dashboard",
  "/workouts": "Workout Log",
  "/progress": "Progress Tracking",
  "/analytics": "Analytics",
  "/calculators": "Fitness Calculators",
  "/goals": "Goals",
  "/records": "Personal Records",
  "/settings": "Settings",
};

export function Header({ onMenuClick }) {
  const { theme, setTheme, achievements } = useApp();
  const location = useLocation();
  const title = titles[location.pathname] || "FitTrack Pro";
  const recentAch = achievements.slice(-1)[0];

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-semibold text-gray-900 dark:text-white text-base">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        {recentAch && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs font-medium">
            <span>{recentAch.icon}</span>
            <span>{recentAch.title}</span>
          </div>
        )}
        <button
          onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
