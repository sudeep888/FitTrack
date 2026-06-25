import { useState } from "react";
import { Target, Check, Edit2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Modal } from "../components/ui/Modal";

function GoalCard({ title, current, target, unit, description, color = "emerald" }) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const colors = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{title}</h3>
        {pct >= 100 && <span className="badge badge-green gap-1"><Check size={11} /> Done</span>}
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{pct}%</span>
        <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">complete</span>
      </div>
      <div className="progress-bar">
        <div className={`h-full rounded-full transition-all duration-700 ${colors[color]}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{description}</span>
        <span className="font-medium">{current} / {target} {unit}</span>
      </div>
    </div>
  );
}

export function Goals() {
  const { goals, setGoals, workouts, measurements, profile, addToast } = useApp();
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState(goals);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Calculate current progress
  const thisWeek = workouts.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    const start = new Date(now.setDate(now.getDate() - now.getDay()));
    return d >= start;
  }).length;

  const thisMonth = workouts.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const latestWeight = measurements[0]?.weight || profile.weight;
  const weightLost = Math.max(0, parseFloat(profile.weight) - parseFloat(latestWeight));
  const weightGoalRemaining = Math.max(0, parseFloat(profile.weight) - parseFloat(goals.targetWeight));

  const handleSave = (e) => {
    e.preventDefault();
    setGoals(form);
    setShowEdit(false);
    addToast("Goals updated!");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="page-header flex items-center justify-between">
        <div>
          <h2 className="page-title">Goals</h2>
          <p className="page-subtitle">Track your progress toward your targets</p>
        </div>
        <button className="btn-secondary" onClick={() => { setForm(goals); setShowEdit(true); }}>
          <Edit2 size={15} /> Edit Goals
        </button>
      </div>

      <div className="space-y-3">
        <GoalCard
          title="Weekly Workout Goal"
          current={thisWeek}
          target={goals.weeklyWorkouts || 4}
          unit="workouts"
          description="This week's progress"
          color="emerald"
        />
        <GoalCard
          title="Monthly Workout Goal"
          current={thisMonth}
          target={goals.monthlyWorkouts || 16}
          unit="workouts"
          description="This month's progress"
          color="blue"
        />
        <GoalCard
          title="Weight Loss Goal"
          current={weightLost}
          target={weightGoalRemaining + weightLost || 1}
          unit="kg"
          description={`Target: ${goals.targetWeight}kg | Starting: ${profile.weight}kg`}
          color="purple"
        />
      </div>

      {/* Summary */}
      <div className="card p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10 border-emerald-100 dark:border-emerald-800">
        <Target size={20} className="text-emerald-600 dark:text-emerald-400 mb-2" />
        <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm mb-1">Keep Going!</h3>
        <p className="text-xs text-emerald-700 dark:text-emerald-400">
          You've logged {workouts.length} total workouts. {thisWeek >= (goals.weeklyWorkouts || 4) ? "You've already hit your weekly goal — bonus session?" : `${Math.max(0, (goals.weeklyWorkouts || 4) - thisWeek)} more this week to hit your target.`}
        </p>
      </div>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Goals">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Target Weight (kg)</label>
            <input type="number" className="input" value={form.targetWeight} onChange={e => set("targetWeight", +e.target.value)} step="0.5" min="30" max="300" />
          </div>
          <div>
            <label className="label">Weekly Workout Goal</label>
            <input type="number" className="input" value={form.weeklyWorkouts} onChange={e => set("weeklyWorkouts", +e.target.value)} min="1" max="14" />
          </div>
          <div>
            <label className="label">Monthly Workout Goal</label>
            <input type="number" className="input" value={form.monthlyWorkouts} onChange={e => set("monthlyWorkouts", +e.target.value)} min="1" max="60" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Goals</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
