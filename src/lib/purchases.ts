import type { PlanId } from "@/lib/premium";

export type PurchaseResult =
  | { status: "success"; plan: PlanId }
  | { status: "cancelled" }
  | { status: "unavailable" };

/**
 * Billing entry points used by the premium popup.
 *
 * Real in-app purchases are not wired yet (the products have to exist in App Store
 * Connect / Google Play Console first). Both functions currently report "unavailable",
 * which the UI handles without granting any entitlement.
 *
 * To go live, replace the bodies with calls to your billing library
 * (e.g. RevenueCat's `Purchases.purchasePackage` / `Purchases.restorePurchases`,
 * or expo-iap) and return "success" with the purchased plan.
 */
export async function purchasePlan(_plan: PlanId): Promise<PurchaseResult> {
  return { status: "unavailable" };
}

export async function restorePurchases(): Promise<PurchaseResult> {
  return { status: "unavailable" };
}
