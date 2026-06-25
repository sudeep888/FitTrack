import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, Flame, Trophy, Target, TrendingUp, Calendar, Scale, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { useApp } from "../context/AppContext";
import { getDailyQuote } from "../data/quotes";
import { ACTIVITY_MULTIPLIERS } from "../data/muscleGroups";

function StatCard({ icon: Icon, label, value, sub, color = "emerald", trend }) {
  const colors = {
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  };
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
        <div className={`p-1.5 rounded-lg ${colors[color]}`}><Icon size={15} /></div>
      </div>
      <div className="mt-1">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
        {sub && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{sub}</span>}
      </div>
      {trend && <p className="text-xs text-gray-400 dark:text-gray-500">{trend}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="card px-3 py-2 text-xs shadow-lg">
        <p className="text-gray-500 dark:text-gray-400">{label}</p>
        <p className="font-semibold text-emerald-600">{payload[0].value} workouts</p>
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const { workouts, measurements, goals, profile, getStreak, achievements } = useApp();
  const quote = getDailyQuote();
  const streak = getStreak();

  const bmi = useMemo(() => {
    const h = profile.height / 100;
    return (profile.weight / (h * h)).toFixed(1);
  }, [profile]);

  const bmiLabel = useMemo(() => {
    const b = parseFloat(bmi);
    if (b < 18.5) return { label: "Underweight", color: "text-blue-500" };
    if (b < 25) return { label: "Normal", color: "text-emerald-500" };
    if (b < 30) return { label: "Overweight", color: "text-yellow-500" };
    return { label: "Obese", color: "text-red-500" };
  }, [bmi]);

  const calsBurned = useMemo(() => {
    const mult = ACTIVITY_MULTIPLIERS[profile.activityLevel] || 1.55;
    const bmr = profile.gender === "male"
      ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
      : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
    return Math.round(bmr * mult);
  }, [profile]);

  // Weekly chart data (last 8 weeks)
  const weeklyData = useMemo(() => {
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const count = workouts.filter(w => {
        const d = new Date(w.date);
        return d >= start && d <= end;
      }).length;
      const label = `W${8 - i}`;
      weeks.push({ label, workouts: count });
    }
    return weeks;
  }, [workouts]);

  // Monthly data (last 6 months)
  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("default", { month: "short" });
      const count = workouts.filter(w => {
        const wd = new Date(w.date);
        return wd.getMonth() === d.getMonth() && wd.getFullYear() === d.getFullYear();
      }).length;
      months.push({ label, workouts: count });
    }
    return months;
  }, [workouts]);

  // Goal progress
  const thisWeekWorkouts = workouts.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    return d >= weekStart;
  }).length;

  const weeklyGoalPct = Math.min(100, Math.round((thisWeekWorkouts / (goals.weeklyWorkouts || 4)) * 100));
  const latestWeight = measurements[0]?.weight || profile.weight;
  const weightProgress = Math.min(100, Math.max(0, Math.round(
    ((profile.weight - latestWeight) / (profile.weight - goals.targetWeight)) * 100
  )));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome + Quote */}
      <div className="card p-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-emerald-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Welcome back, {profile.name}! 💪</h2>
            <p className="text-emerald-100 text-sm mt-1 max-w-md">"{quote.text}"</p>
            <p className="text-emerald-200 text-xs mt-1">— {quote.author}</p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-3 self-start sm:self-center">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="text-2xl font-bold">{streak}</p>
                <p className="text-emerald-100 text-xs">day streak</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Dumbbell} label="Total Workouts" value={workouts.length} sub="logged" trend="All time" color="emerald" />
        <StatCard icon={Flame} label="Streak" value={streak} sub="days" trend="Keep it up!" color="orange" />
        <StatCard icon={Scale} label="Current Weight" value={latestWeight} sub="kg" trend={`Goal: ${goals.targetWeight}kg`} color="blue" />
        <StatCard icon={Activity} label="Est. TDEE" value={calsBurned} sub="kcal/day" trend="Based on your profile" color="purple" />
      </div>

      {/* BMI + Goal Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* BMI Card */}
        <div className="stat-card">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">BMI</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{bmi}</span>
            <span className={`text-sm font-medium mb-1 ${bmiLabel.color}`}>{bmiLabel.label}</span>
          </div>
          <div className="progress-bar mt-2">
            <div className="progress-fill" style={{ width: `${Math.min(100, (parseFloat(bmi) / 35) * 100)}%` }} />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Healthy range: 18.5 – 24.9</p>
        </div>

        {/* Weekly Goal */}
        <div className="stat-card">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Weekly Goal</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{thisWeekWorkouts}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">/ {goals.weeklyWorkouts} workouts</span>
          </div>
          <div className="progress-bar mt-2">
            <div className="progress-fill" style={{ width: `${weeklyGoalPct}%` }} />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{weeklyGoalPct}% complete this week</p>
        </div>

        {/* Achievements */}
        <div className="stat-card sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Achievements</p>
          <span className="text-3xl font-bold text-gray-900 dark:text-white mt-1 block">{achievements.length}</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {achievements.slice(-4).map(a => (
              <span key={a.id} title={a.title} className="text-xl">{a.icon}</span>
            ))}
            {achievements.length === 0 && <p className="text-xs text-gray-400 dark:text-gray-500">Complete workouts to unlock!</p>}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Activity */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4 text-sm">Weekly Activity (Last 8 Weeks)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "currentColor" }} className="text-gray-400" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "currentColor" }} className="text-gray-400" axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="workouts" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4 text-sm">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "currentColor" }} className="text-gray-400" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "currentColor" }} className="text-gray-400" axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="workouts" stroke="#10b981" strokeWidth={2} fill="url(#wGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: "/workouts", label: "Log Workout", icon: Dumbbell, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
          { to: "/progress", label: "Add Measurements", icon: TrendingUp, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
          { to: "/goals", label: "Update Goals", icon: Target, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
          { to: "/records", label: "Log a PR", icon: Trophy, color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" },
        ].map(({ to, label, icon: Icon, color }) => (
          <Link key={to} to={to} className="card p-4 flex flex-col items-center gap-2 text-center hover:shadow-md transition-shadow group">
            <div className={`p-2.5 rounded-xl ${color} group-hover:scale-110 transition-transform`}><Icon size={20} /></div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
