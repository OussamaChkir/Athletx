import { useOnboardingStore } from "@/store/onboarding-store";
import type { BodyWeightUnit, HeightUnit } from "@/lib/weight";

/**
 * Single source of truth for the user's measurement units.
 *
 * The unit is chosen during onboarding (or later in Edit Profile) and stored in
 * the onboarding store. Every screen that shows or accepts a weight or height
 * must read it from here instead of keeping its own copy or hardcoding a label.
 *
 * Stored values stay canonical where it matters: logged lifts and weigh-ins are
 * kilograms, converted for display with `fromKg` / `toKg` from "@/lib/weight".
 */
export function useWeightUnit(): BodyWeightUnit {
  return useOnboardingStore((s) => s.weight.unit);
}

export function useHeightUnit(): HeightUnit {
  return useOnboardingStore((s) => s.height.unit);
}
