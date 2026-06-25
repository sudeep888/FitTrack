import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AppContext = createContext(null);

const STORAGE_KEYS = {
  workouts: "fittrack_workouts",
  measurements: "fittrack_measurements",
  goals: "fittrack_goals",
  prs: "fittrack_prs",
  profile: "fittrack_profile",
  theme: "fittrack_theme",
  achievements: "fittrack_achievements",
};

const DEFAULT_PROFILE = {
  name: "Athlete",
  age: 25,
  gender: "male",
  height: 175,
  weight: 75,
  goalWeight: 70,
  activityLevel: "moderate",
  joinDate: new Date().toISOString(),
};

const DEFAULT_PRS = [
  { id: "bench", name: "Bench Press", weight: 0, date: null, history: [] },
  { id: "squat", name: "Squat", weight: 0, date: null, history: [] },
  { id: "deadlift", name: "Deadlift", weight: 0, date: null, history: [] },
  { id: "ohp", name: "Overhead Press", weight: 0, date: null, history: [] },
];

function loadStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

function saveStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function AppProvider({ children }) {
  const [workouts, setWorkouts] = useState(() => loadStorage(STORAGE_KEYS.workouts, []));
  const [measurements, setMeasurements] = useState(() => loadStorage(STORAGE_KEYS.measurements, []));
  const [goals, setGoals] = useState(() => loadStorage(STORAGE_KEYS.goals, { targetWeight: 70, weeklyWorkouts: 4, monthlyWorkouts: 16 }));
  const [prs, setPrs] = useState(() => loadStorage(STORAGE_KEYS.prs, DEFAULT_PRS));
  const [profile, setProfile] = useState(() => loadStorage(STORAGE_KEYS.profile, DEFAULT_PROFILE));
  const [achievements, setAchievements] = useState(() => loadStorage(STORAGE_KEYS.achievements, []));
  const [theme, setTheme] = useState(() => loadStorage(STORAGE_KEYS.theme, "light"));
  const [toasts, setToasts] = useState([]);

  // Persist all state
  useEffect(() => { saveStorage(STORAGE_KEYS.workouts, workouts); }, [workouts]);
  useEffect(() => { saveStorage(STORAGE_KEYS.measurements, measurements); }, [measurements]);
  useEffect(() => { saveStorage(STORAGE_KEYS.goals, goals); }, [goals]);
  useEffect(() => { saveStorage(STORAGE_KEYS.prs, prs); }, [prs]);
  useEffect(() => { saveStorage(STORAGE_KEYS.profile, profile); }, [profile]);
  useEffect(() => { saveStorage(STORAGE_KEYS.achievements, achievements); }, [achievements]);
  useEffect(() => {
    saveStorage(STORAGE_KEYS.theme, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Toast system
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  // Achievement checker
  const checkAchievements = useCallback((updatedWorkouts) => {
    const newAchievements = [];
    const earned = achievements.map(a => a.id);
    const count = updatedWorkouts.length;

    const checks = [
      { id: "first_workout", title: "First Step", desc: "Logged your first workout!", icon: "🏋️", condition: count >= 1 },
      { id: "workouts_10", title: "Getting Warmed Up", desc: "Completed 10 workouts!", icon: "🔥", condition: count >= 10 },
      { id: "workouts_50", title: "Half Century", desc: "50 workouts done!", icon: "💪", condition: count >= 50 },
      { id: "workouts_100", title: "Century Club", desc: "100 workouts! You're elite.", icon: "🏆", condition: count >= 100 },
    ];

    for (const check of checks) {
      if (check.condition && !earned.includes(check.id)) {
        newAchievements.push({ ...check, unlockedAt: new Date().toISOString() });
      }
    }

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      newAchievements.forEach(a => addToast(`🏆 Achievement: ${a.title}`, "achievement"));
    }
  }, [achievements, addToast]);

  // Workout CRUD
  const addWorkout = useCallback((workout) => {
    const newWorkout = { ...workout, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setWorkouts(prev => {
      const updated = [newWorkout, ...prev];
      checkAchievements(updated);
      return updated;
    });
    addToast("Workout logged successfully!");
  }, [checkAchievements, addToast]);

  const updateWorkout = useCallback((id, updates) => {
    setWorkouts(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
    addToast("Workout updated.");
  }, [addToast]);

  const deleteWorkout = useCallback((id) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
    addToast("Workout deleted.", "error");
  }, [addToast]);

  // Measurement CRUD
  const addMeasurement = useCallback((m) => {
    const entry = { ...m, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setMeasurements(prev => [entry, ...prev]);
    addToast("Measurements saved!");
  }, [addToast]);

  const deleteMeasurement = useCallback((id) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
    addToast("Entry deleted.", "error");
  }, [addToast]);

  // PR update
  const updatePR = useCallback((id, weight, date = new Date().toISOString()) => {
    setPrs(prev => prev.map(pr => {
      if (pr.id !== id) return pr;
      if (weight > pr.weight) {
        addToast(`🎯 New PR on ${pr.name}: ${weight}kg!`, "achievement");
        return { ...pr, weight, date, history: [...(pr.history || []), { weight, date }] };
      }
      return { ...pr, history: [...(pr.history || []), { weight, date }] };
    }));
  }, [addToast]);

  const addCustomPR = useCallback((name) => {
    const newPR = { id: Date.now().toString(), name, weight: 0, date: null, history: [], custom: true };
    setPrs(prev => [...prev, newPR]);
    addToast(`PR tracker added for ${name}!`);
  }, [addToast]);

  // Workout streak calculator
  const getStreak = useCallback(() => {
    if (!workouts.length) return 0;
    const dates = [...new Set(workouts.map(w => w.date))].sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    let current = new Date();
    current.setHours(0, 0, 0, 0);
    for (const d of dates) {
      const day = new Date(d);
      day.setHours(0, 0, 0, 0);
      const diff = Math.round((current - day) / 86400000);
      if (diff <= 1) { streak++; current = day; }
      else break;
    }
    return streak;
  }, [workouts]);

  // Export / Import / Reset
  const exportData = useCallback(() => {
    const data = { workouts, measurements, goals, prs, profile, achievements, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fittrack-backup-${Date.now()}.json`;
    a.click(); URL.revokeObjectURL(url);
    addToast("Data exported successfully!");
  }, [workouts, measurements, goals, prs, profile, achievements, addToast]);

  const importData = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.workouts) setWorkouts(data.workouts);
        if (data.measurements) setMeasurements(data.measurements);
        if (data.goals) setGoals(data.goals);
        if (data.prs) setPrs(data.prs);
        if (data.profile) setProfile(data.profile);
        if (data.achievements) setAchievements(data.achievements);
        addToast("Data imported successfully!");
      } catch { addToast("Failed to import data. Invalid file.", "error"); }
    };
    reader.readAsText(file);
  }, [addToast]);

  const resetData = useCallback(() => {
    setWorkouts([]); setMeasurements([]); setGoals({ targetWeight: 70, weeklyWorkouts: 4, monthlyWorkouts: 16 });
    setPrs(DEFAULT_PRS); setAchievements([]);
    addToast("All data has been reset.", "error");
  }, [addToast]);

  const value = {
    workouts, addWorkout, updateWorkout, deleteWorkout,
    measurements, addMeasurement, deleteMeasurement,
    goals, setGoals,
    prs, updatePR, addCustomPR,
    profile, setProfile,
    achievements,
    theme, setTheme,
    toasts, addToast, removeToast,
    getStreak,
    exportData, importData, resetData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
