import { canCreatePlan, isPreparedWorkoutLocked } from "@/lib/entitlements";
import { usePremiumStore } from "@/store/premium-store";
import { useWorkoutStore } from "@/store/workout-store";

/** Reactive view of the current user's access rights. Use this in screens to gate features. */
export function usePremiumAccess() {
  const isPremium = usePremiumStore((s) => s.isPremium);
  const planCount = useWorkoutStore((s) => s.plans.length);

  return {
    isPremium,
    planCount,
    /** False when a free user already owns the maximum number of plans. */
    canCreatePlan: canCreatePlan(planCount, isPremium),
    /** `index` is the workout's position in the prepared-workouts list. */
    isPreparedWorkoutLocked: (index: number) => isPreparedWorkoutLocked(index, isPremium),
  };
}
