import type { LucideIcon } from "lucide-react-native";
import { BanIcon, ChartLine, InfinityIcon, Library } from "lucide-react-native";
import i18n from "@/i18n";

export type PlanId = "monthly" | "yearly";

export interface PremiumPlan {
  id: PlanId;
  /** Product identifier to create in App Store Connect / Google Play Console. */
  productId: string;
  /** Fallback USD price shown until the store-localized price loads from RevenueCat. */
  price: number;
}

/** Translated plan name (keys `premium:plans.<id>.title`). */
export function planTitle(id: PlanId): string {
  return i18n.t(`premium:plans.${id}.title`);
}

/** Translated billing period noun, e.g. "month" / "year" (keys `premium:plans.<id>.period`). */
export function planPeriod(id: PlanId): string {
  return i18n.t(`premium:plans.${id}.period`);
}

export const PREMIUM_PLANS: Record<PlanId, PremiumPlan> = {
  monthly: {
    id: "monthly",
    productId: "athletx_premium_monthly",
    price: 4.99,
  },
  yearly: {
    id: "yearly",
    productId: "athletx_premium_yearly",
    price: 29.99,
  },
};

/**
 * Length of the free trial advertised on the paywall. This is display text only: the trial itself must be
 * configured in the stores (App Store Connect introductory offer / Google Play base plan free-trial offer)
 * with the same length, otherwise users would be charged immediately.
 */
export const FREE_TRIAL_DAYS = 7;

/** Percentage saved by choosing yearly over twelve monthly payments. */
export const YEARLY_SAVINGS_PERCENT = Math.round(
  (1 - PREMIUM_PLANS.yearly.price / (PREMIUM_PLANS.monthly.price * 12)) * 100,
);

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/** Display text lives in `premium:benefits.<id>.title` / `.description`. */
export const PREMIUM_BENEFITS: { id: string; icon: LucideIcon }[] = [
  { id: "noAds", icon: BanIcon },
  { id: "unlimitedPlans", icon: InfinityIcon },
  { id: "allWorkouts", icon: Library },
  { id: "advancedStats", icon: ChartLine },
];

export const TERMS_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";
export const PRIVACY_URL = "https://oussamachkir.github.io/athletx-website/privacy.html";
