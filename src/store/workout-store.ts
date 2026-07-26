import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_EQUIPMENT, FOCUS_PRESETS } from "@/lib/constants";
import { createId } from "@/lib/id";
import { generateWorkout } from "@/lib/exercises";
import type { Difficulty, EquipmentId, GeneratorOptions, MuscleId, SavedWorkout, WorkoutExercise, WorkoutFocus, WorkoutHistoryEntry } from "@/lib/types";

type State = {
  equipment: EquipmentId[]; muscles: MuscleId[]; focus: WorkoutFocus; exerciseCount: number; difficulties: Difficulty[];
  currentWorkout: WorkoutExercise[]; workoutName: string; savedWorkouts: SavedWorkout[]; history: WorkoutHistoryEntry[];
  liveIndex: number; livePhase: "exercise" | "rest" | "done"; liveSet: number; restRemaining: number; sessionStartedAt: string | null;
  toggleEquipment(id: EquipmentId): void; toggleMuscle(id: MuscleId): void; setFocus(v: WorkoutFocus): void; setExerciseCount(v: number): void;
  setWorkoutName(v: string): void; generate(): WorkoutExercise[]; addExercise(e: WorkoutExercise): void; removeExercise(id: string): void;
  reorderExercises(from: number, to: number): boolean; updateExercise(id: string, patch: Partial<WorkoutExercise>): void; saveCurrentWorkout(): string;
  startLiveSession(): void; completeSet(): void; skipRest(): void; tickRest(): void; finishWorkout(seconds: number): void;
};
export const useWorkoutStore = create<State>()(persist((set, get) => ({
  equipment: DEFAULT_EQUIPMENT, muscles: [], focus: "hypertrophy", exerciseCount: 6, difficulties: [], currentWorkout: [], workoutName: "My Workout", savedWorkouts: [], history: [], liveIndex: 0, livePhase: "exercise", liveSet: 1, restRemaining: 0, sessionStartedAt: null,
  toggleEquipment: (id) => set(s => ({ equipment: s.equipment.includes(id) ? s.equipment.filter(x => x !== id) : [...s.equipment, id] })),
  toggleMuscle: (id) => set(s => ({ muscles: s.muscles.includes(id) ? s.muscles.filter(x => x !== id) : [...s.muscles, id], currentWorkout: [] })),
  setFocus: (focus) => set({ focus }), setExerciseCount: (exerciseCount) => set({ exerciseCount }), setWorkoutName: (workoutName) => set({ workoutName }),
  generate: () => { const s = get(); const workout = generateWorkout(s.equipment, s.muscles, { exerciseCount: s.exerciseCount, focus: s.focus, difficulties: s.difficulties } as GeneratorOptions); set({ currentWorkout: workout, workoutName: `${s.muscles.slice(0, 2).join(" + ") || "Custom"} · ${FOCUS_PRESETS[s.focus].label}` }); return workout; },
  addExercise: (e) => set(s => ({ currentWorkout: [...s.currentWorkout, e] })), removeExercise: (id) => set(s => ({ currentWorkout: s.currentWorkout.filter(e => e.instanceId !== id) })),
  reorderExercises: (from, to) => { set(s => { const list = [...s.currentWorkout]; const [moved] = list.splice(from, 1); list.splice(to, 0, moved); return { currentWorkout: list }; }); return false; },
  updateExercise: (id, patch) => set(s => ({ currentWorkout: s.currentWorkout.map(e => e.instanceId === id ? { ...e, ...patch } : e) })),
  saveCurrentWorkout: () => { const s = get(); const id = createId(); set({ savedWorkouts: [{ id, name: s.workoutName, createdAt: new Date().toISOString(), focus: s.focus, equipment: s.equipment, muscles: s.muscles, exercises: s.currentWorkout }, ...s.savedWorkouts] }); return id; },
  startLiveSession: () => set(s => ({ liveIndex: 0, livePhase: "exercise", liveSet: 1, restRemaining: 0, sessionStartedAt: new Date().toISOString(), currentWorkout: s.currentWorkout.map(e => ({ ...e, completed: false, loggedSets: [] })) })),
  completeSet: () => { const s = get(), e = s.currentWorkout[s.liveIndex]; if (!e) return; const list = s.currentWorkout.map((x, i) => i === s.liveIndex ? { ...x, loggedSets: [...x.loggedSets, { reps: x.reps, completed: true }] } : x); if (s.liveSet >= e.sets) { list[s.liveIndex] = { ...list[s.liveIndex], completed: true }; if (s.liveIndex === list.length - 1) return set({ currentWorkout: list, livePhase: "done" }); return set({ currentWorkout: list, liveIndex: s.liveIndex + 1, liveSet: 1, livePhase: "rest", restRemaining: e.restSeconds }); } set({ currentWorkout: list, liveSet: s.liveSet + 1, livePhase: "rest", restRemaining: e.restSeconds }); },
  skipRest: () => set({ livePhase: "exercise", restRemaining: 0 }), tickRest: () => { const s = get(); if (s.livePhase === "rest") set(s.restRemaining <= 1 ? { livePhase: "exercise", restRemaining: 0 } : { restRemaining: s.restRemaining - 1 }); },
  finishWorkout: (durationSeconds) => { const s = get(); const entry: WorkoutHistoryEntry = { id: createId(), workoutId: createId(), name: s.workoutName, completedAt: new Date().toISOString(), exerciseCount: s.currentWorkout.length, totalSets: s.currentWorkout.reduce((n, e) => n + e.loggedSets.length, 0), totalVolume: 0, durationSeconds, muscles: [...new Set(s.currentWorkout.map(e => e.mainMuscle))] }; set({ history: [entry, ...s.history], livePhase: "done" }); },
}), { name: "athletx-workout-store", storage: createJSONStorage(() => AsyncStorage), partialize: s => ({ equipment: s.equipment, muscles: s.muscles, focus: s.focus, exerciseCount: s.exerciseCount, difficulties: s.difficulties, currentWorkout: s.currentWorkout, workoutName: s.workoutName, savedWorkouts: s.savedWorkouts, history: s.history }) }));
