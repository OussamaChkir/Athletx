/**
 * Single source of truth for what the free tier can and can't do.
 * Pure functions only (no store or UI imports) so stores, screens and tests can all share them.
 */

/** Must match the Entitlement identifier created in the RevenueCat dashboard. */
export const PREMIUM_ENTITLEMENT_ID = "premium";

/** Free users can own at most this many plans in total (the onboarding "Smart Plan" counts). */
export const FREE_MAX_PLANS = 3;

/** Free users can open / enroll in only the first N prepared workouts (by list order). */
export const FREE_PREPARED_WORKOUT_COUNT = 2;

export function canCreatePlan(planCount: number, isPremium: boolean): boolean {
  return isPremium || planCount < FREE_MAX_PLANS;
}

/** `index` is the position of the workout in the prepared-workouts list (0-based). */
export function isPreparedWorkoutLocked(index: number, isPremium: boolean): boolean {
  return !isPremium && index >= FREE_PREPARED_WORKOUT_COUNT;
}

export type PaywallReason = "plan_limit" | "prepared_workout";

export const PAYWALL_MESSAGES: Record<PaywallReason, string> = {
  plan_limit: `Free accounts can have up to ${FREE_MAX_PLANS} plans. Go Premium for unlimited plans.`,
  prepared_workout: `Free accounts include the first ${FREE_PREPARED_WORKOUT_COUNT} prepared workouts. Go Premium to unlock them all.`,
};
