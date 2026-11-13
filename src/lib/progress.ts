import { addMonths, addWeeks, addYears, differenceInCalendarDays, endOfMonth, endOfWeek, endOfYear, startOfDay, startOfMonth, startOfWeek, startOfYear } from "date-fns";
import { getExerciseById } from "./exercises";
import type { HistoryExercise, WorkoutHistoryEntry } from "./types";
import type { Slug } from "react-native-body-highlighter";

/* ───────────────────────── periods ───────────────────────── */

export type Period = "week" | "month" | "year";

export interface DateRange {
  start: Date;
  /** Inclusive end of the last day. */
  end: Date;
}

/** Weeks start on Monday. `offset` moves whole periods back (negative) or forward. */
export function periodRange(period: Period, offset = 0, now = new Date()): DateRange {
  if (period === "week") {
    const base = addWeeks(now, offset);
    return { start: startOfWeek(base, { weekStartsOn: 1 }), end: endOfWeek(base, { weekStartsOn: 1 }) };
  }
  if (period === "month") {
    const base = addMonths(now, offset);
    return { start: startOfMonth(base), end: endOfMonth(base) };
  }
  const base = addYears(now, offset);
  return { start: startOfYear(base), end: endOfYear(base) };
}

const inRange = (iso: string, range: DateRange) => {
  const t = new Date(iso).getTime();
  return t >= range.start.getTime() && t <= range.end.getTime();
};

export function entriesInRange(history: WorkoutHistoryEntry[], range: DateRange): WorkoutHistoryEntry[] {
  return history.filter((h) => inRange(h.completedAt, range));
}

/* ───────────────────────── headline stats ───────────────────────── */

/** Consecutive days with a workout, ending today or yesterday. */
export function currentStreak(history: WorkoutHistoryEntry[], now = new Date()): number {
  if (!history.length) return 0;
  const days = [...new Set(history.map((h) => startOfDay(new Date(h.completedAt)).getTime()))].sort((a, b) => b - a);
  const today = startOfDay(now);
  if (differenceInCalendarDays(today, days[0]) > 1) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if (differenceInCalendarDays(days[i - 1], days[i]) !== 1) break;
    streak++;
  }
  return streak;
}

/** 32400 → "32.4k", 950 → "950". */
export function compactNumber(n: number): string {
  if (n >= 1000) return `${(Math.round(n / 100) / 10).toString()}k`;
  return String(Math.round(n));
}

/* ───────────────────────── personal records ───────────────────────── */

/** Epley estimate of a one-rep max. */
export const estimateOneRepMax = (weight: number, reps: number) => weight * (1 + reps / 30);

function bestOneRepMax(sets: HistoryExercise["sets"]): number {
  let best = 0;
  for (const set of sets) {
    if (set.weight && set.weight > 0 && set.reps > 0) best = Math.max(best, estimateOneRepMax(set.weight, set.reps));
  }
  return best;
}

export interface PersonalRecord {
  exerciseId: string;
  title: string;
  /** Heaviest set of the workout, in kilograms. */
  weight: number;
  reps: number;
  /** The heaviest weight logged for this exercise before. */
  previousWeight: number;
}

/** Heaviest set of an exercise (most reps wins a tie). */
function heaviestSet(sets: HistoryExercise["sets"]): { weight: number; reps: number } | null {
  let best: { weight: number; reps: number } | null = null;
  for (const set of sets) {
    if (!set.weight || set.weight <= 0) continue;
    if (!best || set.weight > best.weight || (set.weight === best.weight && set.reps > best.reps)) {
      best = { weight: set.weight, reps: set.reps };
    }
  }
  return best;
}

/** Latest logged set for an exercise, newest workout first (the "Last time" hint while training). */
export function lastLoggedSet(history: WorkoutHistoryEntry[], exerciseId: string): { weight?: number; reps: number } | null {
  for (const entry of history) {
    const ex = entry.exercises?.find((e) => e.exerciseId === exerciseId);
    const last = ex?.sets[ex.sets.length - 1];
    if (last) return last;
  }
  return null;
}

/**
 * Exercises where the heaviest set beats every earlier workout. An exercise needs an earlier
 * recorded weight to count, so the first time you log a lift is not a record.
 */
export function detectRecords(exercises: HistoryExercise[], history: WorkoutHistoryEntry[]): PersonalRecord[] {
  const previousBest = new Map<string, number>();
  for (const entry of history) {
    for (const ex of entry.exercises ?? []) {
      const best = heaviestSet(ex.sets);
      if (best) previousBest.set(ex.exerciseId, Math.max(previousBest.get(ex.exerciseId) ?? 0, best.weight));
    }
  }
  const records: PersonalRecord[] = [];
  for (const ex of exercises) {
    const before = previousBest.get(ex.exerciseId);
    const best = heaviestSet(ex.sets);
    if (before && best && best.weight > before + 0.001) {
      records.push({ exerciseId: ex.exerciseId, title: ex.title, weight: best.weight, reps: best.reps, previousWeight: before });
    }
  }
  return records;
}

export const countPersonalRecords = (exercises: HistoryExercise[], history: WorkoutHistoryEntry[]) =>
  detectRecords(exercises, history).length;

/* ───────────────────────── muscle groups ───────────────────────── */

export interface MuscleGroup {
  id: string;
  label: string;
  /** Recommended working sets per week: [low, high]. */
  weeklySets: readonly [number, number];
  /** Body-highlighter parts that light up for this group. */
  slugs: readonly Slug[];
  /** Muscle names from the exercise data (and the older broad targets) that belong to the group. */
  members: readonly string[];
}

export const MUSCLE_GROUPS: readonly MuscleGroup[] = [
  { id: "chest", label: "Chest", weeklySets: [10, 20], slugs: ["chest"], members: ["Chest"] },
  { id: "shoulders", label: "Shoulders", weeklySets: [8, 20], slugs: ["deltoids"], members: ["Front Delts", "Side Delts", "Rear Delts", "Shoulders"] },
  { id: "lats", label: "Lats & upper back", weeklySets: [10, 20], slugs: ["upper-back"], members: ["Lats", "Upper Back", "Back"] },
  { id: "traps", label: "Traps", weeklySets: [4, 12], slugs: ["trapezius"], members: ["Traps"] },
  { id: "lower-back", label: "Lower back", weeklySets: [4, 10], slugs: ["lower-back"], members: ["Lower Back"] },
  { id: "biceps", label: "Biceps", weeklySets: [8, 18], slugs: ["biceps"], members: ["Biceps", "Brachialis"] },
  { id: "triceps", label: "Triceps", weeklySets: [6, 16], slugs: ["triceps"], members: ["Triceps"] },
  { id: "forearms", label: "Forearms", weeklySets: [4, 12], slugs: ["forearm"], members: ["Forearms"] },
  { id: "abs", label: "Abs & core", weeklySets: [8, 16], slugs: ["abs", "obliques"], members: ["Abs", "Core", "Obliques", "Hip Flexors"] },
  { id: "quads", label: "Quads", weeklySets: [8, 18], slugs: ["quadriceps"], members: ["Quads", "Legs"] },
  { id: "hamstrings", label: "Hamstrings", weeklySets: [6, 16], slugs: ["hamstring"], members: ["Hamstrings"] },
  { id: "glutes", label: "Glutes", weeklySets: [4, 16], slugs: ["gluteal"], members: ["Glutes"] },
  { id: "calves", label: "Calves", weeklySets: [8, 16], slugs: ["calves"], members: ["Calves"] },
  { id: "adductors", label: "Inner thighs", weeklySets: [2, 10], slugs: ["adductors"], members: ["Inner Thighs"] },
  { id: "shins", label: "Shins", weeklySets: [2, 10], slugs: ["tibialis"], members: ["Shins"] },
];

const groupByMember = new Map<string, MuscleGroup>();
for (const g of MUSCLE_GROUPS) for (const m of g.members) groupByMember.set(m, g);

export const groupOfMuscle = (name: string) => groupByMember.get(name);

/** A secondary muscle counts as half a set. */
const SECONDARY_WEIGHT = 0.5;

/** How much one set of an exercise counts towards each muscle group (1 primary, 0.5 secondary). */
export function groupWeights(exerciseId: string, mainMuscle: string): Map<string, number> {
  const weights = new Map<string, number>();
  const add = (muscle: string, weight: number) => {
    const group = groupOfMuscle(muscle);
    if (group) weights.set(group.id, Math.max(weights.get(group.id) ?? 0, weight));
  };
  const exercise = getExerciseById(exerciseId);
  if (exercise?.primary_muscles?.length) {
    exercise.primary_muscles.forEach((m) => add(m, 1));
    exercise.secondary_muscles?.forEach((m) => add(m, SECONDARY_WEIGHT));
  } else {
    add(mainMuscle, 1);
  }
  return weights;
}

/** Scale the weekly target to a period of `days` days. */
export function targetRange(group: MuscleGroup, days: number): [number, number] {
  const k = days / 7;
  return [Math.round(group.weeklySets[0] * k), Math.round(group.weeklySets[1] * k)];
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Weighted sets per muscle group. Workouts without per-set data spread their sets over their muscles. */
export function setsByGroup(entries: WorkoutHistoryEntry[]): Map<string, number> {
  const totals = new Map<string, number>();
  const add = (id: string, n: number) => totals.set(id, (totals.get(id) ?? 0) + n);
  for (const entry of entries) {
    if (entry.exercises?.length) {
      for (const ex of entry.exercises) {
        groupWeights(ex.exerciseId, ex.mainMuscle).forEach((w, id) => add(id, w * ex.sets.length));
      }
    } else {
      const groups = [...new Set(entry.muscles.map((m) => groupOfMuscle(m)?.id).filter((x): x is string => !!x))];
      for (const id of groups) add(id, entry.totalSets / groups.length);
    }
  }
  for (const [id, n] of totals) totals.set(id, round1(n));
  return totals;
}

/** Weighted sets a plan schedules in one week (rest days have no exercises). */
export function plannedSetsByGroup(
  days: { exercises: { exerciseId: string; mainMuscle: string; sets: number }[] }[],
): Map<string, number> {
  const totals = new Map<string, number>();
  for (const day of days) {
    for (const ex of day.exercises) {
      groupWeights(ex.exerciseId, ex.mainMuscle).forEach((w, id) => totals.set(id, (totals.get(id) ?? 0) + w * ex.sets));
    }
  }
  for (const [id, n] of totals) totals.set(id, round1(n));
  return totals;
}

/**
 * Recent load per muscle group as a 0–100 score. Sets count fully when fresh and lose half their
 * weight every 48 hours; 100 means half of the weekly maximum was done within the last couple of days.
 */
export function fatigueByGroup(history: WorkoutHistoryEntry[], at: Date): Map<string, number> {
  const raw = new Map<string, number>();
  for (const entry of history) {
    const hours = (at.getTime() - new Date(entry.completedAt).getTime()) / 3_600_000;
    if (hours < 0 || hours > 24 * 7) continue;
    const decay = 0.5 ** (hours / 48);
    const sets = setsByGroup([entry]);
    sets.forEach((n, id) => raw.set(id, (raw.get(id) ?? 0) + n * decay));
  }
  const scores = new Map<string, number>();
  raw.forEach((n, id) => {
    const group = MUSCLE_GROUPS.find((g) => g.id === id);
    if (group) scores.set(id, Math.min(100, Math.round((n / (group.weeklySets[1] / 2)) * 100)));
  });
  return scores;
}

/** Best estimated one-rep max (kg) per muscle group among exercises that train it as a primary muscle. */
export function strengthByGroup(entries: WorkoutHistoryEntry[]): Map<string, number> {
  const best = new Map<string, number>();
  for (const entry of entries) {
    for (const ex of entry.exercises ?? []) {
      const e1rm = bestOneRepMax(ex.sets);
      if (e1rm <= 0) continue;
      groupWeights(ex.exerciseId, ex.mainMuscle).forEach((w, id) => {
        if (w >= 1) best.set(id, Math.max(best.get(id) ?? 0, e1rm));
      });
    }
  }
  return best;
}

/** Days in a range, for scaling weekly targets. */
export const rangeDays = (range: DateRange) => differenceInCalendarDays(range.end, range.start) + 1;

