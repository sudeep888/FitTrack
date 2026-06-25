import { useState, useMemo } from "react";
import { Plus, Search, Filter, Edit2, Trash2, Dumbbell, SortAsc, SortDesc, ChevronDown } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { MUSCLE_GROUPS } from "../data/muscleGroups";

const DEFAULT_FORM = { exercise: "", muscleGroup: "Chest", sets: "", reps: "", weight: "", date: new Date().toISOString().split("T")[0], notes: "" };

function WorkoutForm({ initial = DEFAULT_FORM, onSubmit, onCancel, submitLabel = "Save" }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.exercise.trim()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Exercise Name *</label>
          <input className="input" value={form.exercise} onChange={e => set("exercise", e.target.value)} placeholder="e.g. Bench Press" required />
        </div>
        <div>
          <label className="label">Muscle Group</label>
          <select className="select" value={form.muscleGroup} onChange={e => set("muscleGroup", e.target.value)}>
            {MUSCLE_GROUPS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input type="date" className="input" value={form.date} onChange={e => set("date", e.target.value)} />
        </div>
        <div>
          <label className="label">Sets</label>
          <input type="number" className="input" value={form.sets} onChange={e => set("sets", e.target.value)} placeholder="3" min="1" />
        </div>
        <div>
          <label className="label">Reps</label>
          <input type="number" className="input" value={form.reps} onChange={e => set("reps", e.target.value)} placeholder="10" min="1" />
        </div>
        <div>
          <label className="label">Weight (kg)</label>
          <input type="number" className="input" value={form.weight} onChange={e => set("weight", e.target.value)} placeholder="60" min="0" step="0.5" />
        </div>
        <div>
          <label className="label">Notes</label>
          <input className="input" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Optional notes..." />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}

function WorkoutCard({ workout, onEdit, onDelete }) {
  const volume = workout.sets && workout.reps && workout.weight
    ? `${(workout.sets * workout.reps * parseFloat(workout.weight)).toFixed(0)}kg total`
    : null;

  const muscleColors = {
    Chest: "badge-blue", Back: "badge-green", Shoulders: "badge-purple",
    Biceps: "badge-orange", Triceps: "badge-purple", Legs: "badge-green",
    Core: "badge-blue", Cardio: "badge-orange", "Full Body": "badge-green",
  };

  return (
    <div className="card p-4 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{workout.exercise}</h3>
            <span className={`badge ${muscleColors[workout.muscleGroup] || "badge-green"}`}>{workout.muscleGroup}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(workout.date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(workout)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(workout.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        {workout.sets && <Pill label={`${workout.sets} sets`} />}
        {workout.reps && <Pill label={`${workout.reps} reps`} />}
        {workout.weight && <Pill label={`${workout.weight} kg`} accent />}
        {volume && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{volume}</span>}
      </div>
      {workout.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">{workout.notes}</p>}
    </div>
  );
}

function Pill({ label, accent }) {
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${accent ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
      {label}
    </span>
  );
}

export function WorkoutLog() {
  const { workouts, addWorkout, updateWorkout, deleteWorkout } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editWorkout, setEditWorkout] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterMuscle, setFilterMuscle] = useState("All");
  const [sortDir, setSortDir] = useState("desc");

  const filtered = useMemo(() => {
    let list = [...workouts];
    if (search) list = list.filter(w => w.exercise.toLowerCase().includes(search.toLowerCase()));
    if (filterMuscle !== "All") list = list.filter(w => w.muscleGroup === filterMuscle);
    list.sort((a, b) => sortDir === "desc" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date));
    return list;
  }, [workouts, search, filterMuscle, sortDir]);

  const handleEdit = (workout) => {
    setEditWorkout(workout);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="page-title">Workout Log</h2>
          <p className="page-subtitle">{workouts.length} workouts logged</p>
        </div>
        <button className="btn-primary self-start" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Log Workout
        </button>
      </div>

      {/* Filters */}
      <div className="card p-3 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-8" placeholder="Search exercises..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <select className="select w-auto" value={filterMuscle} onChange={e => setFilterMuscle(e.target.value)}>
            <option>All</option>
            {MUSCLE_GROUPS.map(m => <option key={m}>{m}</option>)}
          </select>
          <button className="btn-secondary px-3" onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}>
            {sortDir === "desc" ? <SortDesc size={15} /> : <SortAsc size={15} />}
          </button>
        </div>
      </div>

      {/* Workout List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No workouts found"
          description={workouts.length === 0 ? "Start logging your workouts to track progress." : "Try adjusting your search or filters."}
          action={<button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Log your first workout</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(w => (
            <WorkoutCard key={w.id} workout={w} onEdit={handleEdit} onDelete={setDeleteId} />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Log Workout">
        <WorkoutForm onSubmit={(data) => { addWorkout(data); setShowAdd(false); }} onCancel={() => setShowAdd(false)} submitLabel="Log Workout" />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editWorkout} onClose={() => setEditWorkout(null)} title="Edit Workout">
        {editWorkout && (
          <WorkoutForm
            initial={editWorkout}
            onSubmit={(data) => { updateWorkout(editWorkout.id, data); setEditWorkout(null); }}
            onCancel={() => setEditWorkout(null)}
            submitLabel="Save Changes"
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteWorkout(deleteId)}
        title="Delete Workout"
        message="Are you sure you want to delete this workout? This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
