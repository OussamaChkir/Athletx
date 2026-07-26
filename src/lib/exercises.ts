import rawExercises from "@/data/exercises.json";
import { EXCLUDED_CATEGORIES, FOCUS_PRESETS } from "./constants";
import type {
  Difficulty,
  Exercise,
  GeneratorOptions,
  MuscleId,
  WorkoutExercise,
  WorkoutFocus,
} from "./types";
import { createId } from "./id";

const exercises = (rawExercises as Exercise[]).map((exercise) => ({
  ...exercise,
  mainMuscle: exercise.targets?.[0] ?? "Unknown",
}));

export function getAllExercises(includeExcluded = false): Exercise[] {
  if (includeExcluded) return exercises;
  return exercises.filter(
    (e) =>
      !EXCLUDED_CATEGORIES.includes(
        e.category as (typeof EXCLUDED_CATEGORIES)[number]
      ) && e.difficulty !== "Yoga"
  );
}

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((e) => e._id === id);
}

/** Equipment filter from workout-lol: every required piece must be available. */
export function matchesEquipment(
  exercise: Exercise,
  availableEquipment: string[]
): boolean {
  if (!exercise.equipment?.length) return true;
  return exercise.equipment.every((item) => availableEquipment.includes(item));
}

export function matchesMuscle(
  exercise: Exercise,
  muscles: string[]
): boolean {
  if (!muscles.length) return true;
  const primary = exercise.mainMuscle ?? exercise.targets?.[0];
  if (!primary) return false;
  return muscles.some(
    (muscle) =>
      primary === muscle ||
      primary.includes(muscle) ||
      exercise.targets.some((t) => t === muscle || t.includes(muscle))
  );
}

export function filterExercises(options: {
  equipment?: string[];
  muscles?: string[];
  difficulties?: string[];
  search?: string;
  categories?: string[];
  includeExcluded?: boolean;
}): Exercise[] {
  const {
    equipment,
    muscles,
    difficulties,
    search,
    categories,
    includeExcluded = false,
  } = options;

  let result = getAllExercises(includeExcluded);

  if (equipment?.length) {
    result = result.filter((e) => matchesEquipment(e, equipment));
  }

  if (muscles?.length) {
    result = result.filter((e) => matchesMuscle(e, muscles));
  }

  if (difficulties?.length) {
    result = result.filter((e) => difficulties.includes(e.difficulty));
  }

  if (categories?.length) {
    result = result.filter((e) => categories.includes(e.category));
  }

  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.targets.some((t) => t.toLowerCase().includes(q)) ||
        e.equipment.some((eq) => eq.toLowerCase().includes(q)) ||
        e.category.toLowerCase().includes(q)
    );
  }

  return result;
}

export function getMuscleCounts(equipment: string[]) {
  const filtered = filterExercises({ equipment });
  const counts: Record<
    string,
    { count: number; beginner: number; intermediate: number; advanced: number }
  > = {};

  for (const exercise of filtered) {
    const muscle = exercise.mainMuscle ?? "Unknown";
    if (!counts[muscle]) {
      counts[muscle] = { count: 0, beginner: 0, intermediate: 0, advanced: 0 };
    }
    counts[muscle].count += 1;
    const d = exercise.difficulty.toLowerCase();
    if (d === "beginner") counts[muscle].beginner += 1;
    if (d === "intermediate") counts[muscle].intermediate += 1;
    if (d === "advanced") counts[muscle].advanced += 1;
  }

  return Object.entries(counts).map(([id, stats]) => ({ _id: id, ...stats }));
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Interleave by muscle so the session feels balanced (workout-lol). */
export function sortByPropertyWithHighDistribution<T extends Record<string, unknown>>(
  arr: T[],
  property: keyof T
): T[] {
  const sortedArr = [...arr].sort((a, b) => {
    const av = String(a[property]);
    const bv = String(b[property]);
    if (av < bv) return -1;
    if (av > bv) return 1;
    return 0;
  });

  const frequencies: Record<string, number> = {};
  for (const obj of sortedArr) {
    const value = String(obj[property]);
    frequencies[value] = (frequencies[value] || 0) + 1;
  }

  const uniqueValues = Object.keys(frequencies);
  const maxFrequency = Math.max(0, ...Object.values(frequencies));
  const rearranged: T[] = [];

  for (let i = 0; i < maxFrequency; i++) {
    for (const value of uniqueValues) {
      const subset = sortedArr.filter((obj) => String(obj[property]) === value);
      if (subset.length > i) rearranged.push(subset[i]);
    }
  }

  return rearranged;
}

export function createWorkoutExercise(
  exercise: Exercise,
  focus: WorkoutFocus,
  overrides?: Partial<WorkoutExercise>
): WorkoutExercise {
  const preset = FOCUS_PRESETS[focus];
  return {
    instanceId: createId(),
    exerciseId: exercise._id,
    title: exercise.title,
    mainMuscle: exercise.mainMuscle ?? exercise.targets[0] ?? "Unknown",
    equipment: exercise.equipment,
    gif: exercise.image,
    steps: exercise.steps,
    difficulty: exercise.difficulty,
    sets: preset.sets,
    reps: preset.reps,
    restSeconds: preset.restSeconds,
    completed: false,
    loggedSets: [],
    ...overrides,
  };
}

export function generateWorkout(
  equipment: string[],
  muscles: MuscleId[],
  options: GeneratorOptions
): WorkoutExercise[] {
  const difficulties =
    options.difficulties.length > 0
      ? options.difficulties
      : (["Beginner", "Intermediate", "Advanced"] as Difficulty[]);

  const pool = filterExercises({
    equipment,
    muscles,
    difficulties,
  });

  if (!pool.length) return [];

  const perMuscle = Math.max(
    1,
    Math.round(options.exerciseCount / Math.max(muscles.length, 1))
  );

  // Mirror workout-lol: shuffle then take up to perMuscle per main muscle
  const picked = shuffle(pool).reduce<Exercise[]>((acc, curr) => {
    const muscle = curr.mainMuscle ?? curr.targets[0];
    const countForMuscle = acc.filter(
      (e) => (e.mainMuscle ?? e.targets[0]) === muscle
    ).length;
    if (countForMuscle < perMuscle) return [...acc, curr];
    return acc;
  }, []);

  let result = [...picked];
  if (result.length < options.exerciseCount) {
    for (const exercise of shuffle(pool)) {
      if (result.length >= options.exerciseCount) break;
      if (!result.find((e) => e._id === exercise._id)) {
        result.push(exercise);
      }
    }
  }

  result = sortByPropertyWithHighDistribution(
    result.slice(0, options.exerciseCount).map((e) => ({
      ...e,
      mainMuscle: e.mainMuscle ?? e.targets[0],
    })),
    "mainMuscle"
  );

  return result.map((e) => createWorkoutExercise(e, options.focus));
}

export function getUniqueMuscles(includeExcluded = false): string[] {
  const set = new Set(
    getAllExercises(includeExcluded).map((e) => e.mainMuscle ?? e.targets[0])
  );
  return [...set].filter(Boolean).sort();
}

export function getUniqueEquipment(includeExcluded = false): string[] {
  const set = new Set(
    getAllExercises(includeExcluded).flatMap((e) => e.equipment)
  );
  return [...set].sort();
}
