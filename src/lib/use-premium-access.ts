import { canCreatePlan, isPreparedWorkoutLocked } from "@/lib/entitlements";
import { isUnlockActive, useAdsStore } from "@/store/ads-store";
import { usePremiumStore } from "@/store/premium-store";
import { useWorkoutStore } from "@/store/workout-store";

/** Reactive view of the current user's access rights. Use this in screens to gate features. */
export function usePremiumAccess() {
  const isPremium = usePremiumStore((s) => s.isPremium);
  const planCount = useWorkoutStore((s) => s.plans.length);
  const workoutUnlocks = useAdsStore((s) => s.workoutUnlocks);

  return {
    isPremium,
    planCount,
    /** False when a free user already owns the maximum number of plans. */
    canCreatePlan: canCreatePlan(planCount, isPremium),
    /**
     * `index` is the workout's position in the prepared-workouts list. Pass `workoutId` so a workout the
     * user unlocked by watching a rewarded ad (still within its unlock window) counts as unlocked.
     */
    isPreparedWorkoutLocked: (index: number, workoutId?: string) =>
      isPreparedWorkoutLocked(index, isPremium) &&
      !(workoutId !== undefined && isUnlockActive(workoutUnlocks[workoutId])),
  };
}
