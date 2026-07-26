import type { EquipmentId, MuscleId, WorkoutFocus } from "./types";

export const EXCLUDED_CATEGORIES = [
  "Yoga",
  "TRX",
  "Medicine Ball",
  "Machine",
  "Cables",
  "Stretches",
] as const;

export const EQUIPMENT_LIST: {
  id: EquipmentId;
  label: string;
  description: string;
  hasImage: boolean;
}[] = [
  { id: "none", label: "Bodyweight", description: "No gear needed", hasImage: true },
  { id: "dumbbell", label: "Dumbbells", description: "Free weights", hasImage: true },
  { id: "barbell", label: "Barbell", description: "Compound lifts", hasImage: true },
  { id: "kettlebell", label: "Kettlebell", description: "Swings & presses", hasImage: true },
  { id: "band", label: "Bands", description: "Resistance bands", hasImage: true },
  { id: "plate", label: "Weight Plate", description: "Plate-loaded", hasImage: true },
  { id: "pull-up-bar", label: "Pull-up Bar", description: "Pull & hang", hasImage: true },
  { id: "bench", label: "Bench", description: "Press & support", hasImage: true },
  { id: "cable", label: "Cables", description: "Cable stack", hasImage: false },
  { id: "leg-machine", label: "Machines", description: "Guided machines", hasImage: false },
];

export const MUSCLES: {
  id: MuscleId;
  label: string;
  group: "upper" | "core" | "lower";
}[] = [
  { id: "Chest", label: "Chest", group: "upper" },
  { id: "Shoulders", label: "Shoulders", group: "upper" },
  { id: "Lats", label: "Lats", group: "upper" },
  { id: "Traps", label: "Traps", group: "upper" },
  { id: "Biceps", label: "Biceps", group: "upper" },
  { id: "Triceps", label: "Triceps", group: "upper" },
  { id: "Forearms", label: "Forearms", group: "upper" },
  { id: "Abdominals", label: "Abs", group: "core" },
  { id: "Obliques", label: "Obliques", group: "core" },
  { id: "Lower back", label: "Lower Back", group: "core" },
  { id: "Quads", label: "Quads", group: "lower" },
  { id: "Hamstrings", label: "Hamstrings", group: "lower" },
  { id: "Glutes", label: "Glutes", group: "lower" },
  { id: "Calves", label: "Calves", group: "lower" },
];

export const MUSCLE_COLORS: Record<string, string> = {
  Abdominals: "#ff4d6d",
  Biceps: "#f72585",
  Calves: "#b5179e",
  Chest: "#7b2cbf",
  Forearms: "#560bad",
  Glutes: "#4361ee",
  Hamstrings: "#4895ef",
  Lats: "#4cc9f0",
  "Lower back": "#06d6a0",
  Obliques: "#80ed99",
  Quads: "#befc8d",
  Shoulders: "#ffd166",
  Traps: "#f4a261",
  Triceps: "#e76f51",
};

export const FOCUS_PRESETS: Record<
  WorkoutFocus,
  { sets: number; reps: number; restSeconds: number; label: string; blurb: string }
> = {
  strength: {
    sets: 4,
    reps: 5,
    restSeconds: 120,
    label: "Strength",
    blurb: "Heavy loads, longer rest",
  },
  hypertrophy: {
    sets: 3,
    reps: 10,
    restSeconds: 75,
    label: "Hypertrophy",
    blurb: "Volume for muscle growth",
  },
  endurance: {
    sets: 3,
    reps: 15,
    restSeconds: 45,
    label: "Endurance",
    blurb: "Higher reps, shorter rest",
  },
};

export const DEFAULT_EQUIPMENT: EquipmentId[] = ["none", "dumbbell"];
