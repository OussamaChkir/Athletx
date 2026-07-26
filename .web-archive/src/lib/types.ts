export type Difficulty = "Beginner" | "Intermediate" | "Advanced" | "Yoga";

export type WorkoutFocus = "strength" | "hypertrophy" | "endurance";

export type EquipmentId =
  | "none"
  | "dumbbell"
  | "barbell"
  | "kettlebell"
  | "band"
  | "plate"
  | "pull-up-bar"
  | "bench"
  | "cable"
  | "leg-machine"
  | "trx"
  | "filter";

export type MuscleId =
  | "Abdominals"
  | "Biceps"
  | "Calves"
  | "Chest"
  | "Forearms"
  | "Glutes"
  | "Hamstrings"
  | "Lats"
  | "Lower back"
  | "Obliques"
  | "Quads"
  | "Shoulders"
  | "Traps"
  | "Triceps";

export interface Exercise {
  _id: string;
  title: string;
  steps: string[];
  category: string;
  difficulty: Difficulty | string;
  targets: string[];
  videos: string[];
  equipment: string[];
  mainMuscle?: string;
}

export interface WorkoutSet {
  reps: number;
  weight?: number;
  completed: boolean;
}

export interface WorkoutExercise {
  instanceId: string;
  exerciseId: string;
  title: string;
  mainMuscle: string;
  equipment: string[];
  videos: string[];
  steps: string[];
  difficulty: string;
  sets: number;
  reps: number;
  restSeconds: number;
  completed: boolean;
  loggedSets: WorkoutSet[];
}

export interface SavedWorkout {
  id: string;
  name: string;
  createdAt: string;
  completedAt?: string;
  focus: WorkoutFocus;
  equipment: EquipmentId[];
  muscles: MuscleId[];
  exercises: WorkoutExercise[];
  totalVolume?: number;
  durationSeconds?: number;
}

export interface WorkoutHistoryEntry {
  id: string;
  workoutId: string;
  name: string;
  completedAt: string;
  exerciseCount: number;
  totalSets: number;
  totalVolume: number;
  durationSeconds: number;
  muscles: string[];
}

export interface GeneratorOptions {
  exerciseCount: number;
  focus: WorkoutFocus;
  difficulties: Difficulty[];
}
