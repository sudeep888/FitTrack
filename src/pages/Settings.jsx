import { useState, useRef } from "react";
import { Moon, Sun, Download, Upload, Trash2, User, Trophy, Save } from "lucide-react";
import { useApp } from "../context/AppContext";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { ACTIVITY_LEVELS } from "../data/muscleGroups";

function Section({ title, children }) {
  return (
    <div className="card p-5 space-y-4">
      <h3 className="font-semibold text-gray-800 dark:text-white text-sm border-b border-gray-100 dark:border-gray-800 pb-3">{title}</h3>
      {children}
    </div>
  );
}

export function Settings() {
  const { theme, setTheme, exportData, importData, resetData, profile, setProfile, achievements, addToast } = useApp();
  const [profileForm, setProfileForm] = useState(profile);
  const [showReset, setShowReset] = useState(false);
  const fileRef = useRef(null);
  const set = (k, v) => setProfileForm(f => ({ ...f, [k]: v }));

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile(profileForm);
    addToast("Profile saved!");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="page-header">
        <h2 className="page-title">Settings</h2>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Section title="User Profile">
        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Display Name</label>
              <input className="input" value={profileForm.name} onChange={e => set("name", e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="label">Age</label>
              <input type="number" className="input" value={profileForm.age} onChange={e => set("age", +e.target.value)} min="1" max="120" />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="select" value={profileForm.gender} onChange={e => set("gender", e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Height (cm)</label>
              <input type="number" className="input" value={profileForm.height} onChange={e => set("height", +e.target.value)} min="50" max="300" />
            </div>
            <div>
              <label className="label">Starting Weight (kg)</label>
              <input type="number" className="input" value={profileForm.weight} onChange={e => set("weight", +e.target.value)} step="0.1" min="20" max="500" />
            </div>
            <div className="col-span-2">
              <label className="label">Activity Level</label>
              <select className="select" value={profileForm.activityLevel} onChange={e => set("activityLevel", e.target.value)}>
                {ACTIVITY_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary"><Save size={15} /> Save Profile</button>
          </div>
        </form>
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Switch between light and dark theme</p>
          </div>
          <button
            onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === "dark" ? "bg-emerald-600" : "bg-gray-200 dark:bg-gray-700"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
      </Section>

      {/* Data Management */}
      <Section title="Data Management">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Export Data</p>
              <p className="text-xs text-gray-400">Download all your data as JSON</p>
            </div>
            <button className="btn-secondary" onClick={exportData}>
              <Download size={15} /> Export
            </button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Import Data</p>
              <p className="text-xs text-gray-400">Restore from a backup file</p>
            </div>
            <button className="btn-secondary" onClick={() => fileRef.current?.click()}>
              <Upload size={15} /> Import
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={e => { if (e.target.files[0]) importData(e.target.files[0]); }} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Reset All Data</p>
              <p className="text-xs text-red-400">Permanently delete all workouts, progress, and records</p>
            </div>
            <button className="btn-danger" onClick={() => setShowReset(true)}>
              <Trash2 size={15} /> Reset
            </button>
          </div>
        </div>
      </Section>

      {/* Achievements */}
      <Section title="Achievements">
        {achievements.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No achievements yet. Keep working out!</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {achievements.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-800">
                <span className="text-2xl">{a.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">{a.title}</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500 truncate">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* About */}
      <Section title="About">
        <div className="space-y-2 text-xs text-gray-400 dark:text-gray-500">
          <p><span className="font-medium text-gray-600 dark:text-gray-400">App:</span> FitTrack Pro</p>
          <p><span className="font-medium text-gray-600 dark:text-gray-400">Version:</span> 1.0.0</p>
          <p><span className="font-medium text-gray-600 dark:text-gray-400">Storage:</span> Local Storage (all data stays on your device)</p>
        </div>
      </Section>

      <ConfirmDialog
        isOpen={showReset}
        onClose={() => setShowReset(false)}
        onConfirm={resetData}
        title="Reset All Data"
        message="This will permanently delete ALL your workouts, measurements, goals, and personal records. This action cannot be undone."
        confirmLabel="Reset Everything"
        danger
      />
    </div>
  );
}
