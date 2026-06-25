// Fitness calculation utilities

export const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return 0;
  const h = heightCm / 100;
  return (weightKg / (h * h)).toFixed(1);
};

export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
  if (bmi < 25) return { label: 'Normal', color: 'text-emerald-500' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-amber-500' };
  return { label: 'Obese', color: 'text-red-500' };
};

export const calculateBMR = (age, gender, weightKg, heightCm) => {
  if (!age || !weightKg || !heightCm) return 0;
  if (gender === 'male') {
    return Math.round(88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age));
  }
  return Math.round(447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age));
};

export const activityMultipliers = {
  sedentary: { label: 'Sedentary (little or no exercise)', value: 1.2 },
  light: { label: 'Lightly active (1-3 days/week)', value: 1.375 },
  moderate: { label: 'Moderately active (3-5 days/week)', value: 1.55 },
  active: { label: 'Very active (6-7 days/week)', value: 1.725 },
  veryActive: { label: 'Extra active (twice/day)', value: 1.9 },
};

export const calculateTDEE = (bmr, activityLevel) => {
  const mult = activityMultipliers[activityLevel]?.value || 1.2;
  return Math.round(bmr * mult);
};

export const calculateProtein = (weightKg, goal = 'maintain') => {
  const multipliers = { lose: 2.2, maintain: 1.8, gain: 2.4 };
  return Math.round(weightKg * (multipliers[goal] || 1.8));
};

export const estimateCaloriesBurned = (workouts) => {
  // Simple estimate: avg 300 cal per workout
  return workouts.length * 300;
};

export const calculateStreak = (workouts) => {
  if (!workouts.length) return 0;
  const dates = [...new Set(workouts.map(w => w.date))].sort().reverse();
  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);
  for (const dateStr of dates) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((current - d) / 86400000);
    if (diff <= 1) { streak++; current = d; }
    else break;
  }
  return streak;
};

export const getWeeklyData = (workouts) => {
  const weeks = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en', { weekday: 'short' });
    weeks[key] = { day: label, workouts: 0, volume: 0 };
  }
  workouts.forEach(w => {
    if (weeks[w.date]) {
      weeks[w.date].workouts++;
      const vol = (w.sets || 0) * (w.reps || 0) * (w.weight || 0);
      weeks[w.date].volume += vol;
    }
  });
  return Object.values(weeks);
};

export const getMonthlyData = (workouts) => {
  const months = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en', { month: 'short' });
    months[key] = { month: label, workouts: 0, volume: 0 };
  }
  workouts.forEach(w => {
    const key = w.date?.substring(0, 7);
    if (months[key]) {
      months[key].workouts++;
      months[key].volume += (w.sets || 0) * (w.reps || 0) * (w.weight || 0);
    }
  });
  return Object.values(months);
};

export const getMuscleGroupData = (workouts) => {
  const groups = {};
  workouts.forEach(w => {
    const g = w.muscleGroup || 'Other';
    groups[g] = (groups[g] || 0) + 1;
  });
  const colors = ['#10b981', '#059669', '#047857', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
  return Object.entries(groups).map(([name, value], i) => ({
    name, value, fill: colors[i % colors.length]
  }));
};

export const FITNESS_QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Push yourself, because no one else is going to do it for you.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Success starts with self-discipline.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Don't stop when you're tired. Stop when you're done.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Champions aren't made in the gyms. Champions are made from something they have deep inside them.",
];
