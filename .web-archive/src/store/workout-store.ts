"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_EQUIPMENT, FOCUS_PRESETS } from "@/lib/constants";
import { createWorkoutExercise, generateWorkout } from "@/lib/exercises";
import type {
  Difficulty,
  EquipmentId,
  GeneratorOptions,
  MuscleId,
  SavedWorkout,
  WorkoutExercise,
  WorkoutFocus,
  WorkoutHistoryEntry,
} from "@/lib/types";

interface WorkoutState {
  equipment: EquipmentId[];
  muscles: MuscleId[];
  focus: WorkoutFocus;
  exerciseCount: number;
  difficulties: Difficulty[];
  currentWorkout: WorkoutExercise[];
  workoutName: string;
  savedWorkouts: SavedWorkout[];
  history: WorkoutHistoryEntry[];
  liveIndex: number;
  livePhase: "exercise" | "rest" | "done";
  liveSet: number;
  restRemaining: number;
  sessionStartedAt: string | null;

  setEquipment: (equipment: EquipmentId[]) => void;
  toggleEquipment: (id: EquipmentId) => void;
  setMuscles: (muscles: MuscleId[]) => void;
  toggleMuscle: (id: MuscleId) => void;
  setFocus: (focus: WorkoutFocus) => void;
  setExerciseCount: (count: number) => void;
  setDifficulties: (difficulties: Difficulty[]) => void;
  setWorkoutName: (name: string) => void;
  setCurrentWorkout: (exercises: WorkoutExercise[]) => void;
  generate: () => WorkoutExercise[];
  addExercise: (exercise: WorkoutExercise) => void;
  removeExercise: (instanceId: string) => void;
  reorderExercises: (from: number, to: number) => void;
  updateExercise: (
    instanceId: string,
    patch: Partial<WorkoutExercise>
  ) => void;
  saveCurrentWorkout: () => string;
  loadWorkout: (id: string) => void;
  deleteSavedWorkout: (id: string) => void;
  startLiveSession: () => void;
  completeSet: () => void;
  skipRest: () => void;
  tickRest: () => void;
  nextExercise: () => void;
  prevExercise: () => void;
  finishWorkout: (durationSeconds: number) => void;
  resetLive: () => void;
}

function calcStreak(history: WorkoutHistoryEntry[]): number {
  if (!history.length) return 0;
  const days = [
    ...new Set(
      history.map((h) => new Date(h.completedAt).toISOString().slice(0, 10))
    ),
  ].sort((a, b) => b.localeCompare(a));

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < days.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    const expectedStr = expected.toISOString().slice(0, 10);
    if (days[i] === expectedStr) streak += 1;
    else if (i === 0) {
      // Allow yesterday start
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (days[0] === yesterday.toISOString().slice(0, 10)) {
        streak = 1;
        today.setDate(today.getDate() - 1);
        continue;
      }
      break;
    } else break;
  }
  return streak;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      equipment: DEFAULT_EQUIPMENT,
      muscles: [],
      focus: "hypertrophy",
      exerciseCount: 6,
      difficulties: [],
      currentWorkout: [],
      workoutName: "My Workout",
      savedWorkouts: [],
      history: [],
      liveIndex: 0,
      livePhase: "exercise",
      liveSet: 1,
      restRemaining: 0,
      sessionStartedAt: null,

      setEquipment: (equipment) => set({ equipment }),
      toggleEquipment: (id) =>
        set((s) => ({
          equipment: s.equipment.includes(id)
            ? s.equipment.filter((e) => e !== id)
            : [...s.equipment, id],
        })),
      setMuscles: (muscles) => set({ muscles }),
      toggleMuscle: (id) =>
        set((s) => ({
          muscles: s.muscles.includes(id)
            ? s.muscles.filter((m) => m !== id)
            : [...s.muscles, id],
          currentWorkout: [],
        })),
      setFocus: (focus) => set({ focus }),
      setExerciseCount: (exerciseCount) => set({ exerciseCount }),
      setDifficulties: (difficulties) => set({ difficulties }),
      setWorkoutName: (workoutName) => set({ workoutName }),
      setCurrentWorkout: (currentWorkout) => set({ currentWorkout }),

      generate: () => {
        const s = get();
        const options: GeneratorOptions = {
          exerciseCount: s.exerciseCount,
          focus: s.focus,
          difficulties: s.difficulties,
        };
        const workout = generateWorkout(s.equipment, s.muscles, options);
        const name = `${s.muscles.slice(0, 2).join(" + ") || "Custom"} · ${FOCUS_PRESETS[s.focus].label}`;
        set({ currentWorkout: workout, workoutName: name });
        return workout;
      },

      addExercise: (exercise) =>
        set((s) => ({ currentWorkout: [...s.currentWorkout, exercise] })),

      removeExercise: (instanceId) =>
        set((s) => ({
          currentWorkout: s.currentWorkout.filter(
            (e) => e.instanceId !== instanceId
          ),
        })),

      reorderExercises: (from, to) =>
        set((s) => {
          const list = [...s.currentWorkout];
          const [moved] = list.splice(from, 1);
          list.splice(to, 0, moved);
          return { currentWorkout: list };
        }),

      updateExercise: (instanceId, patch) =>
        set((s) => ({
          currentWorkout: s.currentWorkout.map((e) =>
            e.instanceId === instanceId ? { ...e, ...patch } : e
          ),
        })),

      saveCurrentWorkout: () => {
        const s = get();
        const id = crypto.randomUUID();
        const saved: SavedWorkout = {
          id,
          name: s.workoutName || "My Workout",
          createdAt: new Date().toISOString(),
          focus: s.focus,
          equipment: s.equipment,
          muscles: s.muscles,
          exercises: s.currentWorkout,
        };
        set({ savedWorkouts: [saved, ...s.savedWorkouts] });
        return id;
      },

      loadWorkout: (id) => {
        const saved = get().savedWorkouts.find((w) => w.id === id);
        if (!saved) return;
        set({
          currentWorkout: saved.exercises.map((e) => ({
            ...e,
            instanceId: crypto.randomUUID(),
            completed: false,
            loggedSets: [],
          })),
          workoutName: saved.name,
          focus: saved.focus,
          equipment: saved.equipment,
          muscles: saved.muscles,
        });
      },

      deleteSavedWorkout: (id) =>
        set((s) => ({
          savedWorkouts: s.savedWorkouts.filter((w) => w.id !== id),
        })),

      startLiveSession: () =>
        set({
          liveIndex: 0,
          livePhase: "exercise",
          liveSet: 1,
          restRemaining: 0,
          sessionStartedAt: new Date().toISOString(),
          currentWorkout: get().currentWorkout.map((e) => ({
            ...e,
            completed: false,
            loggedSets: [],
          })),
        }),

      completeSet: () => {
        const s = get();
        const exercise = s.currentWorkout[s.liveIndex];
        if (!exercise) return;

        const loggedSets = [
          ...exercise.loggedSets,
          { reps: exercise.reps, completed: true },
        ];

        const updated = s.currentWorkout.map((e, i) =>
          i === s.liveIndex ? { ...e, loggedSets } : e
        );

        if (s.liveSet >= exercise.sets) {
          updated[s.liveIndex] = {
            ...updated[s.liveIndex],
            completed: true,
          };
          if (s.liveIndex >= s.currentWorkout.length - 1) {
            set({ currentWorkout: updated, livePhase: "done" });
          } else {
            set({
              currentWorkout: updated,
              liveIndex: s.liveIndex + 1,
              liveSet: 1,
              livePhase: "rest",
              restRemaining: exercise.restSeconds,
            });
          }
        } else {
          set({
            currentWorkout: updated,
            liveSet: s.liveSet + 1,
            livePhase: "rest",
            restRemaining: exercise.restSeconds,
          });
        }
      },

      skipRest: () => set({ livePhase: "exercise", restRemaining: 0 }),

      tickRest: () => {
        const s = get();
        if (s.livePhase !== "rest") return;
        if (s.restRemaining <= 1) {
          set({ restRemaining: 0, livePhase: "exercise" });
        } else {
          set({ restRemaining: s.restRemaining - 1 });
        }
      },

      nextExercise: () => {
        const s = get();
        if (s.liveIndex < s.currentWorkout.length - 1) {
          set({
            liveIndex: s.liveIndex + 1,
            liveSet: 1,
            livePhase: "exercise",
            restRemaining: 0,
          });
        }
      },

      prevExercise: () => {
        const s = get();
        if (s.liveIndex > 0) {
          set({
            liveIndex: s.liveIndex - 1,
            liveSet: 1,
            livePhase: "exercise",
            restRemaining: 0,
          });
        }
      },

      finishWorkout: (durationSeconds) => {
        const s = get();
        const totalSets = s.currentWorkout.reduce(
          (acc, e) => acc + e.loggedSets.length,
          0
        );
        const totalVolume = s.currentWorkout.reduce(
          (acc, e) =>
            acc + e.loggedSets.reduce((a, set) => a + set.reps * (set.weight || 0), 0),
          0
        );
        const entry: WorkoutHistoryEntry = {
          id: crypto.randomUUID(),
          workoutId: crypto.randomUUID(),
          name: s.workoutName,
          completedAt: new Date().toISOString(),
          exerciseCount: s.currentWorkout.length,
          totalSets,
          totalVolume,
          durationSeconds,
          muscles: [...new Set(s.currentWorkout.map((e) => e.mainMuscle))],
        };
        const saved: SavedWorkout = {
          id: entry.workoutId,
          name: s.workoutName,
          createdAt: s.sessionStartedAt || new Date().toISOString(),
          completedAt: entry.completedAt,
          focus: s.focus,
          equipment: s.equipment,
          muscles: s.muscles,
          exercises: s.currentWorkout,
          totalVolume,
          durationSeconds,
        };
        set({
          history: [entry, ...s.history],
          savedWorkouts: [saved, ...s.savedWorkouts.filter((w) => w.name !== s.workoutName || !w.completedAt)],
          livePhase: "done",
        });
      },

      resetLive: () =>
        set({
          liveIndex: 0,
          livePhase: "exercise",
          liveSet: 1,
          restRemaining: 0,
          sessionStartedAt: null,
        }),
    }),
    {
      name: "pulsefit-workout-store",
      partialize: (s) => ({
        equipment: s.equipment,
        muscles: s.muscles,
        focus: s.focus,
        exerciseCount: s.exerciseCount,
        difficulties: s.difficulties,
        currentWorkout: s.currentWorkout,
        workoutName: s.workoutName,
        savedWorkouts: s.savedWorkouts,
        history: s.history,
      }),
    }
  )
);

export function useStreak() {
  return calcStreak(useWorkoutStore((s) => s.history));
}

export { createWorkoutExercise };
