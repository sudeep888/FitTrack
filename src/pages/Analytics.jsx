import { useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { useApp } from "../context/AppContext";
import { MUSCLE_COLORS } from "../data/muscleGroups";
import { EmptyState } from "../components/ui/EmptyState";
import { BarChart3 } from "lucide-react";

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6", "#f97316", "#6366f1"];

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="card p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, unit = "" }) => {
  if (active && payload?.length) {
    return (
      <div className="card px-3 py-2 text-xs shadow-lg">
        <p className="text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || "#10b981" }} className="font-semibold">
            {p.name}: {typeof p.value === "number" ? p.value.toFixed(p.value < 10 ? 1 : 0) : p.value}{unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function Analytics() {
  const { workouts } = useApp();

  // Weekly frequency (last 12 weeks)
  const weeklyFreq = useMemo(() => {
    const weeks = [];
    for (let i = 11; i >= 0; i--) {
      const now = new Date();
      const start = new Date(now);
      start.setDate(start.getDate() - i * 7 - now.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const count = workouts.filter(w => {
        const d = new Date(w.date);
        return d >= start && d <= end;
      }).length;
      weeks.push({ week: `W${12 - i}`, count });
    }
    return weeks;
  }, [workouts]);

  // Monthly frequency (last 12 months)
  const monthlyFreq = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
      const count = workouts.filter(w => {
        const wd = new Date(w.date);
        return wd.getMonth() === d.getMonth() && wd.getFullYear() === d.getFullYear();
      }).length;
      months.push({ month: label, count });
    }
    return months;
  }, [workouts]);

  // Volume over time (monthly total kg lifted)
  const volumeData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("default", { month: "short" });
      const volume = workouts
        .filter(w => {
          const wd = new Date(w.date);
          return wd.getMonth() === d.getMonth() && wd.getFullYear() === d.getFullYear();
        })
        .reduce((sum, w) => sum + (parseFloat(w.sets || 0) * parseFloat(w.reps || 0) * parseFloat(w.weight || 0)), 0);
      months.push({ month: label, volume: Math.round(volume) });
    }
    return months;
  }, [workouts]);

  // Muscle group distribution
  const muscleDistribution = useMemo(() => {
    const counts = {};
    workouts.forEach(w => { counts[w.muscleGroup] = (counts[w.muscleGroup] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [workouts]);

  // Consistency score (last 30 days)
  const consistencyScore = useMemo(() => {
    const days = 30;
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - days);
    const activeDays = new Set(
      workouts.filter(w => new Date(w.date) >= start).map(w => w.date)
    ).size;
    return Math.round((activeDays / days) * 100);
  }, [workouts]);

  // Top exercises by frequency
  const topExercises = useMemo(() => {
    const counts = {};
    workouts.forEach(w => { counts[w.exercise] = (counts[w.exercise] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [workouts]);

  if (workouts.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No data yet"
        description="Log some workouts first to see analytics."
      />
    );
  }

  const renderCustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.06) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="600">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="page-header">
        <h2 className="page-title">Analytics</h2>
        <p className="page-subtitle">Deep insights into your training patterns</p>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Workouts", value: workouts.length },
          { label: "Unique Exercises", value: new Set(workouts.map(w => w.exercise)).size },
          { label: "30-Day Consistency", value: `${consistencyScore}%` },
          { label: "Total Volume", value: `${Math.round(workouts.reduce((s, w) => s + (parseFloat(w.sets||0)*parseFloat(w.reps||0)*parseFloat(w.weight||0)), 0) / 1000)}t` },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Frequency */}
        <ChartCard title="Weekly Workout Frequency" subtitle="Last 12 weeks">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyFreq} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Workouts" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Monthly Frequency */}
        <ChartCard title="Monthly Workout Frequency" subtitle="Last 12 months">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyFreq}>
              <defs>
                <linearGradient id="mGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Workouts" stroke="#3b82f6" strokeWidth={2} fill="url(#mGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Volume Over Time */}
        <ChartCard title="Volume Lifted Over Time" subtitle="Total kg moved per month">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={volumeData}>
              <defs>
                <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip unit="kg" />} />
              <Area type="monotone" dataKey="volume" name="Volume" stroke="#8b5cf6" strokeWidth={2} fill="url(#vGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Muscle Distribution Pie */}
        <ChartCard title="Muscle Group Distribution" subtitle="All-time training split">
          {muscleDistribution.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No data</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={muscleDistribution}
                    cx="50%" cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomPieLabel}
                  >
                    {muscleDistribution.map((entry, i) => (
                      <Cell key={entry.name} fill={MUSCLE_COLORS[entry.name] || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} sessions`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {muscleDistribution.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: MUSCLE_COLORS[entry.name] || COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{entry.name}</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-200 ml-auto">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Top Exercises */}
      <ChartCard title="Most Frequent Exercises" subtitle="Your go-to movements">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={topExercises} layout="vertical" barSize={16}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Sessions" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Consistency Score */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-3">30-Day Consistency Score</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="progress-bar h-4">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${consistencyScore}%`,
                  background: consistencyScore >= 70 ? "#10b981" : consistencyScore >= 40 ? "#f59e0b" : "#ef4444"
                }}
              />
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white w-14 text-right">{consistencyScore}%</span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          {consistencyScore >= 70 ? "Excellent consistency! Keep it up." : consistencyScore >= 40 ? "Good effort. Try to be more consistent." : "Room to improve. Aim for more workout days."}
        </p>
      </div>
    </div>
  );
}
