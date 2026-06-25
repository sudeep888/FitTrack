export const MUSCLE_GROUPS = ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Legs", "Core", "Cardio", "Full Body"];

export const MUSCLE_COLORS = {
  Chest: "#ef4444", Back: "#3b82f6", Shoulders: "#8b5cf6",
  Biceps: "#f59e0b", Triceps: "#ec4899", Legs: "#22c55e",
  Core: "#14b8a6", Cardio: "#f97316", "Full Body": "#6366f1",
};

export const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary (little/no exercise)" },
  { value: "light", label: "Lightly active (1-3 days/week)" },
  { value: "moderate", label: "Moderately active (3-5 days/week)" },
  { value: "very", label: "Very active (6-7 days/week)" },
  { value: "extra", label: "Extra active (2x per day)" },
];

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725, extra: 1.9,
};
