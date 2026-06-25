import { useState } from "react";
import { Calculator, Activity, Beef, Scale } from "lucide-react";
import { ACTIVITY_LEVELS, ACTIVITY_MULTIPLIERS } from "../data/muscleGroups";
import { useApp } from "../context/AppContext";

function CalcCard({ icon: Icon, title, children }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
          <Icon size={18} />
        </div>
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ResultBadge({ label, value, sub }) {
  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center border border-emerald-100 dark:border-emerald-800">
      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{value}</p>
      {sub && <p className="text-xs text-emerald-500 dark:text-emerald-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export function Calculators() {
  const { profile } = useApp();

  // BMI
  const [bmi, setBmi] = useState({ height: profile.height || 175, weight: profile.weight || 75 });
  const bmiVal = (bmi.weight / ((bmi.height / 100) ** 2)).toFixed(1);
  const bmiCat = parseFloat(bmiVal) < 18.5 ? "Underweight" : parseFloat(bmiVal) < 25 ? "Normal weight" : parseFloat(bmiVal) < 30 ? "Overweight" : "Obese";

  // BMR
  const [bmr, setBmr] = useState({ age: profile.age || 25, gender: profile.gender || "male", height: profile.height || 175, weight: profile.weight || 75 });
  const bmrVal = bmr.gender === "male"
    ? Math.round(10 * bmr.weight + 6.25 * bmr.height - 5 * bmr.age + 5)
    : Math.round(10 * bmr.weight + 6.25 * bmr.height - 5 * bmr.age - 161);

  // TDEE
  const [activity, setActivity] = useState(profile.activityLevel || "moderate");
  const tdee = Math.round(bmrVal * (ACTIVITY_MULTIPLIERS[activity] || 1.55));

  // Protein
  const [protW, setProtW] = useState(profile.weight || 75);
  const protMin = Math.round(protW * 1.6);
  const protMax = Math.round(protW * 2.2);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="page-header">
        <h2 className="page-title">Fitness Calculators</h2>
        <p className="page-subtitle">Evidence-based tools for your fitness planning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BMI */}
        <CalcCard icon={Scale} title="BMI Calculator">
          <div className="space-y-3">
            <div>
              <label className="label">Height (cm)</label>
              <input type="number" className="input" value={bmi.height} onChange={e => setBmi(b => ({ ...b, height: +e.target.value }))} />
            </div>
            <div>
              <label className="label">Weight (kg)</label>
              <input type="number" className="input" value={bmi.weight} onChange={e => setBmi(b => ({ ...b, weight: +e.target.value }))} />
            </div>
            <ResultBadge label="Your BMI" value={bmiVal} sub={bmiCat} />
            <p className="text-xs text-gray-400 dark:text-gray-500">Healthy BMI range: 18.5 – 24.9</p>
          </div>
        </CalcCard>

        {/* BMR */}
        <CalcCard icon={Activity} title="BMR Calculator">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Age</label>
                <input type="number" className="input" value={bmr.age} onChange={e => setBmr(b => ({ ...b, age: +e.target.value }))} />
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="select" value={bmr.gender} onChange={e => setBmr(b => ({ ...b, gender: e.target.value }))}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="label">Height (cm)</label>
                <input type="number" className="input" value={bmr.height} onChange={e => setBmr(b => ({ ...b, height: +e.target.value }))} />
              </div>
              <div>
                <label className="label">Weight (kg)</label>
                <input type="number" className="input" value={bmr.weight} onChange={e => setBmr(b => ({ ...b, weight: +e.target.value }))} />
              </div>
            </div>
            <ResultBadge label="BMR" value={`${bmrVal} kcal`} sub="Calories burned at rest" />
          </div>
        </CalcCard>

        {/* TDEE */}
        <CalcCard icon={Calculator} title="Calorie Calculator (TDEE)">
          <div className="space-y-3">
            <div>
              <label className="label">Activity Level</label>
              <select className="select" value={activity} onChange={e => setActivity(e.target.value)}>
                {ACTIVITY_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <ResultBadge label="Daily Calories (TDEE)" value={`${tdee} kcal`} sub="To maintain current weight" />
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { label: "Fat Loss", delta: -500, color: "text-blue-600 dark:text-blue-400" },
                { label: "Maintain", delta: 0, color: "text-emerald-600 dark:text-emerald-400" },
                { label: "Muscle Gain", delta: 250, color: "text-orange-600 dark:text-orange-400" },
              ].map(({ label, delta, color }) => (
                <div key={label} className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className={`text-sm font-bold ${color}`}>{tdee + delta}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </CalcCard>

        {/* Protein */}
        <CalcCard icon={Beef} title="Protein Calculator">
          <div className="space-y-3">
            <div>
              <label className="label">Bodyweight (kg)</label>
              <input type="number" className="input" value={protW} onChange={e => setProtW(+e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ResultBadge label="Minimum" value={`${protMin}g`} sub="1.6g per kg" />
              <ResultBadge label="Optimal" value={`${protMax}g`} sub="2.2g per kg" />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              For muscle building, aim for {protMin}–{protMax}g protein daily. Spread across 4–5 meals.
            </p>
          </div>
        </CalcCard>
      </div>
    </div>
  );
}
