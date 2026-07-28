import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Gender = "male" | "female" | "other" | null;
export type Experience = "beginner" | "intermediate" | "advanced" | null;
export type FrequencyStr = "0-1" | "2-3" | "4-5" | "6+" | null;
export type Goal = "lose_weight" | "build_muscle" | "get_stronger" | "maintain" | null;
export type LocationType = "large_gym" | "small_gym" | "home" | "bodyweight";
export type DurationType = "quick" | "20-40" | "40-60" | "60+" | null;
export type SetupType = "smart" | "custom" | null;

export interface OnboardingStateData {
  gender: Gender;
  experience: Experience;
  currentFrequency: FrequencyStr;
  goal: Goal;
  location: LocationType[];
  injuries: string[];
  focusArea: string[];
  age: number | null;
  height: { value: number | null; unit: "cm" | "ft" };
  weight: { value: number | null; unit: "kg" | "lb" };
  goalWeight: number | null;
  duration: DurationType;
  setupType: SetupType;
  targetFrequency: number | null;
  isCompleted: boolean;
}

export interface OnboardingState extends OnboardingStateData {
  currentStep: number;
  setField: <K extends keyof OnboardingStateData>(field: K, value: OnboardingStateData[K]) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeOnboarding: () => void;
  reset: () => void;
}

const initialState: OnboardingStateData & { currentStep: number } = {
  currentStep: 1,
  gender: null,
  experience: null,
  currentFrequency: null,
  goal: null,
  location: [],
  injuries: [],
  focusArea: [],
  age: null,
  height: { value: null, unit: "cm" },
  weight: { value: null, unit: "kg" },
  goalWeight: null,
  duration: null,
  setupType: null,
  targetFrequency: null,
  isCompleted: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setField: (field, value) => set({ [field]: value }),
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 14) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
      completeOnboarding: () => set({ isCompleted: true }),
      reset: () => set(initialState),
    }),
    {
      name: "athletx-onboarding-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
