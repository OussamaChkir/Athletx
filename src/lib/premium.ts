import type { LucideIcon } from "lucide-react-native";
import { BanIcon, ChartLine, InfinityIcon, Library } from "lucide-react-native";

export type PlanId = "monthly" | "yearly";

export interface PremiumPlan {
  id: PlanId;
  /** Product identifier to create in App Store Connect / Google Play Console. */
  productId: string;
  title: string;
  /** Fallback USD price shown until the store-localized price loads from RevenueCat. */
  price: number;
  /** Billing period label, e.g. "month" / "year". */
  period: string;
}

export const PREMIUM_PLANS: Record<PlanId, PremiumPlan> = {
  monthly: {
    id: "monthly",
    productId: "athletx_premium_monthly",
    title: "Monthly",
    price: 4.99,
    period: "month",
  },
  yearly: {
    id: "yearly",
    productId: "athletx_premium_yearly",
    title: "Yearly",
    price: 29.99,
    period: "year",
  },
};

/** Percentage saved by choosing yearly over twelve monthly payments. */
export const YEARLY_SAVINGS_PERCENT = Math.round(
  (1 - PREMIUM_PLANS.yearly.price / (PREMIUM_PLANS.monthly.price * 12)) * 100,
);

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export const PREMIUM_BENEFITS: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: BanIcon, title: "No ads", description: "Train without interruptions" },
  { icon: InfinityIcon, title: "Unlimited custom plans", description: "Build as many routines as you want" },
  { icon: Library, title: "All prepared workouts", description: "Every ready-made program, unlocked" },
  { icon: ChartLine, title: "Advanced stats", description: "Deeper insight into your progress" },
];

export const TERMS_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";
export const PRIVACY_URL = "https://oussamachkir.github.io/athletx-website/privacy.html";
