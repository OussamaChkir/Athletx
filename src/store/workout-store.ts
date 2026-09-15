import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_EQUIPMENT, FOCUS_PRESETS } from "@/lib/constants";
import { createId } from "@/lib/id";
import { generateWorkout } from "@/lib/exercises";
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
import type { OnboardingStateData } from "./onboarding-store";

/* ---- Weekly plan types ---- */
export interface DayPlan {
  dayIndex: number; // 0=Sun, 1=Mon, ..., 6=Sat
  label: string; // "Push", "Pull", "Legs", "Rest", "Upper", "Lower", etc.
  isRest: boolean;
  exercises: WorkoutExercise[];
}

export interface WeekPlan {
  id: string;
  name: string;
  weekNumber: number;
  totalWeeks: number;
  phaseName: string;
  days: DayPlan[];
}

/* ---- Split templates ---- */
const SPLIT_TEMPLATES: Record<number, { label: string; muscles: MuscleId[] }[]> = {
  1: [{ label: "Full Body", muscles: ["Chest", "Lats", "Quads", "Shoulders", "Biceps", "Triceps"] }],
  2: [
    { label: "Upper", muscles: ["Chest", "Shoulders", "Lats", "Traps", "Biceps", "Triceps"] },
    { label: "Lower", muscles: ["Quads", "Hamstrings", "Glutes", "Calves"] },
  ],
  3: [
    { label: "Push", muscles: ["Chest", "Shoulders", "Triceps"] },
    { label: "Pull", muscles: ["Lats", "Traps", "Biceps"] },
    { label: "Legs", muscles: ["Quads", "Hamstrings", "Glutes", "Calves"] },
  ],
  4: [
    { label: "Push", muscles: ["Chest", "Shoulders", "Triceps"] },
    { label: "Pull", muscles: ["Lats", "Traps", "Biceps"] },
    { label: "Legs", muscles: ["Quads", "Hamstrings", "Glutes", "Calves"] },
    { label: "Upper", muscles: ["Chest", "Shoulders", "Lats", "Biceps", "Triceps"] },
  ],
  5: [
    { label: "Push", muscles: ["Chest", "Shoulders", "Triceps"] },
    { label: "Pull", muscles: ["Lats", "Traps", "Biceps"] },
    { label: "Legs", muscles: ["Quads", "Hamstrings", "Glutes", "Calves"] },
    { label: "Upper", muscles: ["Chest", "Shoulders", "Lats", "Biceps", "Triceps"] },
    { label: "Lower", muscles: ["Quads", "Hamstrings", "Glutes", "Calves"] },
  ],
  6: [
    { label: "Push", muscles: ["Chest", "Shoulders", "Triceps"] },
    { label: "Pull", muscles: ["Lats", "Traps", "Biceps"] },
    { label: "Legs", muscles: ["Quads", "Hamstrings", "Glutes", "Calves"] },
    { label: "Push", muscles: ["Chest", "Shoulders", "Triceps"] },
    { label: "Pull", muscles: ["Lats", "Traps", "Biceps"] },
    { label: "Legs", muscles: ["Quads", "Hamstrings", "Glutes", "Calves"] },
  ],
  7: [
    { label: "Push", muscles: ["Chest", "Shoulders", "Triceps"] },
    { label: "Pull", muscles: ["Lats", "Traps", "Biceps"] },
    { label: "Legs", muscles: ["Quads", "Hamstrings", "Glutes", "Calves"] },
    { label: "Push", muscles: ["Chest", "Shoulders", "Triceps"] },
    { label: "Pull", muscles: ["Lats", "Traps", "Biceps"] },
    { label: "Legs", muscles: ["Quads", "Hamstrings", "Glutes", "Calves"] },
    { label: "Full Body", muscles: ["Chest", "Lats", "Quads", "Shoulders"] },
  ],
};

function mapLocationToEquipment(locations: string[]): EquipmentId[] {
  const equip: EquipmentId[] = ["none"];
  if (locations.includes("large_gym")) {
    equip.push("dumbbell", "barbell", "bench", "cable", "leg-machine", "pull-up-bar", "kettlebell");
  }
  if (locations.includes("small_gym")) {
    equip.push("dumbbell", "barbell", "bench", "pull-up-bar", "kettlebell");
  }
  if (locations.includes("home")) {
    equip.push("dumbbell", "band", "kettlebell");
  }
  // bodyweight → only "none" which is already there
  return [...new Set(equip)];
}

function mapGoalToFocus(goal: string | null): WorkoutFocus {
  switch (goal) {
    case "build_muscle": return "hypertrophy";
    case "get_stronger": return "strength";
    case "lose_weight": return "endurance";
    case "maintain": return "hypertrophy";
    default: return "hypertrophy";
  }
}

function getExerciseCountForDuration(duration: string | null): number {
  switch (duration) {
    case "quick": return 4;
    case "20-40": return 5;
    case "40-60": return 7;
    case "60+": return 9;
    default: return 6;
  }
}

type State = {
  equipment: EquipmentId[];
  muscles: MuscleId[];
  focus: WorkoutFocus;
  exerciseCount: number;
  difficulties: Difficulty[];
  currentWorkout: WorkoutExercise[];
  workoutName: string;
  savedWorkouts: SavedWorkout[];
  history: WorkoutHistoryEntry[];
  plans: WeekPlan[];
  activePlanId: string | null;
  liveIndex: number;
  livePhase: "exercise" | "rest" | "done";
  liveSet: number;
  restRemaining: number;
  sessionStartedAt: string | null;
  toggleEquipment(id: EquipmentId): void;
  toggleMuscle(id: MuscleId): void;
  setFocus(v: WorkoutFocus): void;
  setExerciseCount(v: number): void;
  setWorkoutName(v: string): void;
  generate(): WorkoutExercise[];
  generateFromOnboarding(profile: OnboardingStateData): void;
  addExercise(e: WorkoutExercise): void;
  removeExercise(id: string): void;
  reorderExercises(from: number, to: number): boolean;
  updateExercise(id: string, patch: Partial<WorkoutExercise>): void;
  saveCurrentWorkout(): string;
  startLiveSession(): void;
  completeSet(reps?: number, weight?: number): void;
  skipRest(): void;
  addRestTime(seconds: number): void;
  reduceRestTime(seconds: number): void;
  tickRest(): void;
  finishWorkout(seconds: number): void;
  cancelWorkout(): void;
  loadDayWorkout(dayIndex: number): void;
  setActivePlan(id: string): void;
  addPlan(plan: WeekPlan): void;
  deletePlan(id: string): void;
};

export const useWorkoutStore = create<State>()(
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
      plans: [],
      activePlanId: null,
      liveIndex: 0,
      livePhase: "exercise",
      liveSet: 1,
      restRemaining: 0,
      sessionStartedAt: null,

      toggleEquipment: (id) =>
        set((s) => ({
          equipment: s.equipment.includes(id)
            ? s.equipment.filter((x) => x !== id)
            : [...s.equipment, id],
        })),

      toggleMuscle: (id) =>
        set((s) => ({
          muscles: s.muscles.includes(id)
            ? s.muscles.filter((x) => x !== id)
            : [...s.muscles, id],
          currentWorkout: [],
        })),

      setFocus: (focus) => set({ focus }),
      setExerciseCount: (exerciseCount) => set({ exerciseCount }),
      setWorkoutName: (workoutName) => set({ workoutName }),

      generate: () => {
        const s = get();
        const workout = generateWorkout(s.equipment, s.muscles, {
          exerciseCount: s.exerciseCount,
          focus: s.focus,
          difficulties: s.difficulties,
        } as GeneratorOptions);
        set({
          currentWorkout: workout,
          workoutName: `${s.muscles.slice(0, 2).join(" + ") || "Custom"} · ${FOCUS_PRESETS[s.focus].label}`,
        });
        return workout;
      },

      generateFromOnboarding: (profile) => {
        const equip = mapLocationToEquipment(profile.location);
        const focus = mapGoalToFocus(profile.goal);
        const freq = profile.targetFrequency ?? 3;
        const exCount = getExerciseCountForDuration(profile.duration);
        const splitKey = Math.min(freq, 7) as keyof typeof SPLIT_TEMPLATES;
        const template = SPLIT_TEMPLATES[splitKey] || SPLIT_TEMPLATES[3];

        // Distribution of days based on frequency (0=Sun, 6=Sat)
        const getWorkoutDays = (f: number) => {
          switch(f) {
            case 1: return [3]; // Wed
            case 2: return [2, 5]; // Tue, Fri
            case 3: return [1, 3, 5]; // Mon, Wed, Fri
            case 4: return [1, 2, 4, 5]; // Mon, Tue, Thu, Fri
            case 5: return [1, 2, 3, 5, 6]; // Mon, Tue, Wed, Fri, Sat
            case 6: return [1, 2, 3, 4, 5, 6]; // Mon-Sat
            case 7: return [0, 1, 2, 3, 4, 5, 6];
            default: return [1, 3, 5];
          }
        };
        const workoutDays = getWorkoutDays(freq);

        const days: DayPlan[] = [];
        let trainingDayIdx = 0;

        for (let d = 0; d < 7; d++) {
          if (workoutDays.includes(d)) {
            const split = template[trainingDayIdx % template.length];
            const exercises = generateWorkout(equip, split.muscles as MuscleId[], {
              exerciseCount: exCount,
              focus,
              difficulties: [],
            } as GeneratorOptions);

            days.push({
              dayIndex: d,
              label: split.label,
              isRest: false,
              exercises,
            });
            trainingDayIdx++;
          } else {
            days.push({
              dayIndex: d,
              label: "Rest",
              isRest: true,
              exercises: [],
            });
          }
        }

        // Determine phase name based on experience
        let phaseName = "Foundations";
        if (profile.experience === "intermediate") phaseName = "Building";
        if (profile.experience === "advanced") phaseName = "Peak";

        const todayDOW = new Date().getDay(); // 0=Sun
        const todayPlan = days[todayDOW];

        const newPlan: WeekPlan = {
          id: "default",
          name: "Smart Plan",
          weekNumber: 1,
          totalWeeks: 5,
          phaseName,
          days,
        };

        set({
          equipment: equip,
          focus,
          exerciseCount: exCount,
          plans: [newPlan],
          activePlanId: "default",
          currentWorkout: todayPlan && !todayPlan.isRest ? todayPlan.exercises : [],
          workoutName: todayPlan && !todayPlan.isRest ? `${todayPlan.label} Day` : "Rest Day",
        });
      },

      addExercise: (e) =>
        set((s) => ({ currentWorkout: [...s.currentWorkout, e] })),

      removeExercise: (id) =>
        set((s) => ({
          currentWorkout: s.currentWorkout.filter((e) => e.instanceId !== id),
        })),

      reorderExercises: (from, to) => {
        set((s) => {
          const list = [...s.currentWorkout];
          const [moved] = list.splice(from, 1);
          list.splice(to, 0, moved);
          return { currentWorkout: list };
        });
        return false;
      },

      updateExercise: (id, patch) =>
        set((s) => ({
          currentWorkout: s.currentWorkout.map((e) =>
            e.instanceId === id ? { ...e, ...patch } : e
          ),
        })),

      saveCurrentWorkout: () => {
        const s = get();
        const id = createId();
        set({
          savedWorkouts: [
            {
              id,
              name: s.workoutName,
              createdAt: new Date().toISOString(),
              focus: s.focus,
              equipment: s.equipment,
              muscles: s.muscles,
              exercises: s.currentWorkout,
            },
            ...s.savedWorkouts,
          ],
        });
        return id;
      },

      startLiveSession: () =>
        set((s) => ({
          liveIndex: 0,
          livePhase: "exercise",
          liveSet: 1,
          restRemaining: 0,
          sessionStartedAt: new Date().toISOString(),
          currentWorkout: s.currentWorkout.map((e) => ({
            ...e,
            completed: false,
            loggedSets: [],
          })),
        })),

      completeSet: (reps, weight) => {
        const s = get(),
          e = s.currentWorkout[s.liveIndex];
        if (!e) return;
        const loggedSet = { 
          reps: reps ?? e.reps, 
          weight: weight ?? undefined, 
          completed: true 
        };
        const list = s.currentWorkout.map((x, i) =>
          i === s.liveIndex
            ? { ...x, loggedSets: [...x.loggedSets, loggedSet] }
            : x
        );
        if (s.liveSet >= e.sets) {
          list[s.liveIndex] = { ...list[s.liveIndex], completed: true };
          if (s.liveIndex === list.length - 1)
            return set({ currentWorkout: list, livePhase: "done" });
          return set({
            currentWorkout: list,
            liveIndex: s.liveIndex + 1,
            liveSet: 1,
            livePhase: "rest",
            restRemaining: e.restSeconds,
          });
        }
        set({
          currentWorkout: list,
          liveSet: s.liveSet + 1,
          livePhase: "rest",
          restRemaining: e.restSeconds,
        });
      },

      skipRest: () => set({ livePhase: "exercise", restRemaining: 0 }),
      
      addRestTime: (seconds) => set((s) => ({
        restRemaining: s.restRemaining + seconds,
      })),

      reduceRestTime: (seconds) => set((s) => ({
        restRemaining: Math.max(0, s.restRemaining - seconds),
      })),

      tickRest: () => {
        const s = get();
        if (s.livePhase === "rest")
          set(
            s.restRemaining <= 1
              ? { livePhase: "exercise", restRemaining: 0 }
              : { restRemaining: s.restRemaining - 1 }
          );
      },

      finishWorkout: (durationSeconds) => {
        const s = get();
        const entry: WorkoutHistoryEntry = {
          id: createId(),
          workoutId: createId(),
          name: s.workoutName,
          completedAt: new Date().toISOString(),
          exerciseCount: s.currentWorkout.length,
          totalSets: s.currentWorkout.reduce((n, e) => n + e.loggedSets.length, 0),
          totalVolume: 0,
          durationSeconds,
          muscles: [...new Set(s.currentWorkout.map((e) => e.mainMuscle))],
        };
        set({ history: [entry, ...s.history], livePhase: "done" });
      },

      cancelWorkout: () => set({ 
        sessionStartedAt: null, 
        currentWorkout: [], 
        livePhase: "done" // So it won't render LiveScreen logic anymore
      }),

      loadDayWorkout: (dayIndex) => {
        const s = get();
        const activePlan = s.plans.find((p) => p.id === s.activePlanId);
        if (!activePlan) return;
        const day = activePlan.days[dayIndex];
        if (!day || day.isRest) return;
        set({
          currentWorkout: day.exercises,
          workoutName: `${day.label} Day`,
        });
      },

      setActivePlan: (id) => {
        const s = get();
        const plan = s.plans.find((p) => p.id === id);
        if (!plan) return;
        
        const todayDOW = new Date().getDay();
        const todayPlan = plan.days[todayDOW];

        set({
          activePlanId: id,
          currentWorkout: todayPlan && !todayPlan.isRest ? todayPlan.exercises : [],
          workoutName: todayPlan && !todayPlan.isRest ? `${todayPlan.label} Day` : "Rest Day",
        });
      },

      addPlan: (plan) => set((s) => ({ plans: [...s.plans, plan], activePlanId: plan.id })),
      deletePlan: (id) => set((s) => ({ plans: s.plans.filter((p) => p.id !== id), activePlanId: s.activePlanId === id ? (s.plans.find(p => p.id !== id)?.id ?? null) : s.activePlanId })),
    }),
    {
      name: "athletx-workout-store",
      storage: createJSONStorage(() => AsyncStorage),
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
        plans: s.plans,
        activePlanId: s.activePlanId,
      }),
    }
  )
);
