import { useState } from "react";
import { Trophy, Plus, TrendingUp, Edit2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "../context/AppContext";
import { Modal } from "../components/ui/Modal";

function PRCard({ pr, onUpdate }) {
  const [showUpdate, setShowUpdate] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);

  const improvement = pr.history?.length >= 2
    ? (((pr.weight - pr.history[0]?.weight) / (pr.history[0]?.weight || 1)) * 100).toFixed(1)
    : null;

  const chartData = (pr.history || []).map((h, i) => ({
    session: i + 1,
    weight: parseFloat(h.weight),
    date: new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newWeight) return;
    onUpdate(pr.id, parseFloat(newWeight), newDate);
    setNewWeight("");
    setShowUpdate(false);
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-yellow-500" />
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{pr.name}</h3>
            {pr.custom && <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-500">Custom</span>}
          </div>
          {pr.date && <p className="text-xs text-gray-400 mt-0.5">{new Date(pr.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>}
        </div>
        <button onClick={() => setShowUpdate(true)} className="btn-secondary px-2.5 py-1.5 text-xs">
          <Edit2 size={13} /> Update
        </button>
      </div>

      <div className="flex items-end gap-3 mb-3">
        <span className="text-4xl font-bold text-gray-900 dark:text-white">{pr.weight || 0}</span>
        <span className="text-lg text-gray-400 dark:text-gray-500 mb-1">kg</span>
        {improvement !== null && parseFloat(improvement) > 0 && (
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-1">
            <TrendingUp size={14} /> +{improvement}%
          </span>
        )}
      </div>

      {chartData.length >= 2 && (
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={chartData}>
            <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={false} />
            <XAxis dataKey="session" hide />
            <YAxis domain={["auto", "auto"]} hide />
            <Tooltip
              formatter={(v) => [`${v}kg`, "Weight"]}
              labelFormatter={(_, p) => p[0]?.payload?.date}
              content={({ active, payload }) => active && payload?.length ? (
                <div className="card px-2 py-1 text-xs shadow-lg">
                  <p className="text-emerald-600 font-semibold">{payload[0].payload.date}: {payload[0].value}kg</p>
                </div>
              ) : null}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {pr.history?.length === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">No entries yet. Log your first lift!</p>
      )}

      <Modal isOpen={showUpdate} onClose={() => setShowUpdate(false)} title={`Update ${pr.name}`} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Weight (kg)</label>
            <input type="number" className="input" value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder={`Current PR: ${pr.weight}kg`} step="0.5" min="0" autoFocus />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={newDate} onChange={e => setNewDate(e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn-secondary" onClick={() => setShowUpdate(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Log PR</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function Records() {
  const { prs, updatePR, addCustomPR } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addCustomPR(newName.trim());
    setNewName("");
    setShowAdd(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="page-title">Personal Records</h2>
          <p className="page-subtitle">Your all-time bests</p>
        </div>
        <button className="btn-primary self-start" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Exercise
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prs.map(pr => (
          <PRCard key={pr.id} pr={pr} onUpdate={updatePR} />
        ))}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Track New Exercise PR" size="sm">
        <form onSubmit={handleAddCustom} className="space-y-4">
          <div>
            <label className="label">Exercise Name</label>
            <input className="input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Pull-up, Dip, Clean & Press..." autoFocus />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Add Exercise</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
