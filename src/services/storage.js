// Storage service - all localStorage operations
const KEYS = {
  WORKOUTS: 'fittrack_workouts',
  MEASUREMENTS: 'fittrack_measurements',
  GOALS: 'fittrack_goals',
  PRs: 'fittrack_prs',
  PROFILE: 'fittrack_profile',
  THEME: 'fittrack_theme',
  ACHIEVEMENTS: 'fittrack_achievements',
};

export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch { return null; }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch { return false; }
  },
  remove: (key) => { localStorage.removeItem(key); },
  clear: () => { Object.values(KEYS).forEach(k => localStorage.removeItem(k)); },
  exportAll: () => {
    const data = {};
    Object.entries(KEYS).forEach(([name, key]) => {
      data[name] = storage.get(key);
    });
    return data;
  },
  importAll: (data) => {
    Object.entries(KEYS).forEach(([name, key]) => {
      if (data[name] !== undefined) storage.set(key, data[name]);
    });
  },
};

export { KEYS };
