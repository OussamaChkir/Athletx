import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Local calendar day, used for the per-day interstitial cap. */
export const todayKey = () => format(new Date(), "yyyy-MM-dd");

/** A rewarded unlock is active until its expiry timestamp passes. */
export function isUnlockActive(expiresAt: number | undefined): boolean {
  return expiresAt !== undefined && expiresAt > Date.now();
}

/** Where the rewarded ad is in its load cycle. Drives the "Watch an ad" button. */
export type RewardedStatus = "idle" | "loading" | "ready" | "unavailable";

export interface AdsState {
  /** When the last interstitial opened (epoch ms). Enforces the minimum gap between ads. */
  lastInterstitialAt: number;
  /** Local day (yyyy-MM-dd) that `interstitialCountToday` belongs to. */
  interstitialDay: string;
  interstitialCountToday: number;
  /** Prepared workout id -> epoch ms when its rewarded-ad unlock expires. */
  workoutUnlocks: Record<string, number>;
  /** Runtime only (not persisted). */
  rewardedStatus: RewardedStatus;

  /* Actions */
  recordInterstitialShown: () => void;
  /** Call only from the rewarded ad's "earned reward" callback. */
  unlockWorkout: (workoutId: string, durationMs: number) => void;
  setRewardedStatus: (status: RewardedStatus) => void;
}

export const useAdsStore = create<AdsState>()(
  persist(
    (set) => ({
      lastInterstitialAt: 0,
      interstitialDay: "",
      interstitialCountToday: 0,
      workoutUnlocks: {},
      rewardedStatus: "idle",

      recordInterstitialShown: () =>
        set((s) => {
          const day = todayKey();
          return {
            lastInterstitialAt: Date.now(),
            interstitialDay: day,
            interstitialCountToday: s.interstitialDay === day ? s.interstitialCountToday + 1 : 1,
          };
        }),

      unlockWorkout: (workoutId, durationMs) =>
        set((s) => {
          // Drop expired entries while we're writing so the map can't grow without bound.
          const active = Object.fromEntries(
            Object.entries(s.workoutUnlocks).filter(([, expiresAt]) => isUnlockActive(expiresAt)),
          );
          return { workoutUnlocks: { ...active, [workoutId]: Date.now() + durationMs } };
        }),

      setRewardedStatus: (rewardedStatus) => set({ rewardedStatus }),
    }),
    {
      name: "athletx-ads-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        lastInterstitialAt: state.lastInterstitialAt,
        interstitialDay: state.interstitialDay,
        interstitialCountToday: state.interstitialCountToday,
        workoutUnlocks: state.workoutUnlocks,
      }),
    },
  ),
);
