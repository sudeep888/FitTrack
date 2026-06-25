import { useState, useMemo } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useApp } from "../context/AppContext";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";

const DEFAULT_FORM = {
  date: new Date().toISOString().split("T")[0],
  weight: "", chest: "", waist: "", arm: "", thigh: "", notes: "",
};

const METRICS = [
  { key: "weight", label: "Weight", unit: "kg", color: "#10b981" },
  { key: "chest", label: "Chest", unit: "cm", color: "#3b82f6" },
  { key: "waist", label: "Waist", unit: "cm", color: "#ef4444" },
  { key: "arm", label: "Arm", unit: "cm", color: "#8b5cf6" },
  { key: "thigh", label: "Thigh", unit: "cm", color: "#f59e0b" },
];

function TrendIcon({ value, inverted = false }) {
  if (!value || value === 0) return <Minus size={14} className="text-gray-400" />;
  const up = value > 0;
  const good = inverted ? !up : up;
  if (up) return <TrendingUp size={14} className={good ? "text-emerald-500" : "text-red-500"} />;
  return <TrendingDown size={14} className={good ? "text-emerald-500" : "text-red-500"} />;
}

export function Progress() {
  const { measurements, addMeasurement, deleteMeasurement } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [activeMetric, setActiveMetric] = useState("weight");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const sorted = useMemo(() => [...measurements].sort((a, b) => new Date(a.date) - new Date(b.date)), [measurements]);

  const chartData = useMemo(() => sorted.map(m => ({
    date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    ...Object.fromEntries(METRICS.map(mt => [mt.key, m[mt.key] ? parseFloat(m[mt.key]) : null])),
  })), [sorted]);

  const latest = measurements[0];
  const prev = measurements[1];

  const getDelta = (key) => {
    if (!latest?.[key] || !prev?.[key]) return null;
    return (parseFloat(latest[key]) - parseFloat(prev[key])).toFixed(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.weight && !form.chest && !form.waist && !form.arm && !form.thigh) return;
    addMeasurement(form);
    setForm(DEFAULT_FORM);
    setShowAdd(false);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="card px-3 py-2 text-xs shadow-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          {payload.map(p => p.value && (
            <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
              {METRICS.find(m => m.key === p.dataKey)?.label}: {p.value}{METRICS.find(m => m.key === p.dataKey)?.unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const activeM = METRICS.find(m => m.key === activeMetric);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="page-title">Progress Tracking</h2>
          <p className="page-subtitle">{measurements.length} entries recorded</p>
        </div>
        <button className="btn-primary self-start" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Measurements
        </button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {METRICS.map(m => {
          const delta = getDelta(m.key);
          const val = latest?.[m.key];
          return (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`stat-card text-left transition-all ${activeMetric === m.key ? "ring-2 ring-emerald-500 shadow-md" : ""}`}
            >
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{m.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {val ? `${parseFloat(val).toFixed(1)}` : "—"}
                {val && <span className="text-xs font-normal text-gray-400 ml-0.5">{m.unit}</span>}
              </p>
              {delta !== null && (
                <div className="flex items-center gap-1 mt-1">
                  <TrendIcon value={parseFloat(delta)} inverted={m.key === "waist" || m.key === "weight"} />
                  <span className="text-xs text-gray-500">{delta > 0 ? "+" : ""}{delta}{m.unit}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{activeM?.label} Progress</h3>
          <div className="flex gap-1">
            {METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => setActiveMetric(m.key)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${activeMetric === m.key ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        {chartData.length < 2 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-12">Add at least 2 entries to see a chart</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey={activeMetric} stroke={activeM?.color} strokeWidth={2.5} dot={{ r: 4, fill: activeM?.color }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* History Timeline */}
      <div className="card">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Measurement History</h3>
        </div>
        {measurements.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No measurements yet"
            description="Track your body composition over time."
            action={<button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add first entry</button>}
          />
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {[...measurements].sort((a, b) => new Date(b.date) - new Date(a.date)).map(m => (
              <div key={m.id} className="p-4 flex items-start justify-between gap-3 group">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {new Date(m.date).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {METRICS.map(mt => m[mt.key] ? (
                      <span key={mt.key} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {mt.label}: <strong>{parseFloat(m[mt.key]).toFixed(1)}{mt.unit}</strong>
                      </span>
                    ) : null)}
                  </div>
                  {m.notes && <p className="text-xs text-gray-400 mt-1 italic">{m.notes}</p>}
                </div>
                <button
                  onClick={() => setDeleteId(m.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Measurements">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Date</label>
              <input type="date" className="input" value={form.date} onChange={e => set("date", e.target.value)} />
            </div>
            {METRICS.map(m => (
              <div key={m.key}>
                <label className="label">{m.label} ({m.unit})</label>
                <input type="number" className="input" value={form[m.key]} onChange={e => set(m.key, e.target.value)} placeholder="0.0" step="0.1" min="0" />
              </div>
            ))}
            <div className="col-span-2">
              <label className="label">Notes</label>
              <input className="input" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Optional notes..." />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Measurements</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMeasurement(deleteId)}
        title="Delete Entry"
        message="Remove this measurement entry?"
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
