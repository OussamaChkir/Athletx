import { AppState, Linking, Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
  PACKAGE_TYPE,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesError,
  type PurchasesPackage,
} from "react-native-purchases";
import { PREMIUM_ENTITLEMENT_ID } from "@/lib/entitlements";
import { PREMIUM_PLANS, type PlanId } from "@/lib/premium";
import { usePremiumStore } from "@/store/premium-store";

/**
 * RevenueCat integration.
 *
 * RevenueCat is the source of truth for "is this user premium". We mirror the result into
 * `usePremiumStore` so the UI can read it synchronously and the app still behaves sensibly offline.
 *
 * Public SDK keys (not secrets) come from env vars, set in `.env` locally and as EAS environment
 * variables for builds:
 *   EXPO_PUBLIC_REVENUECAT_IOS_API_KEY      (starts with "appl_")
 *   EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY  (starts with "goog_")
 */

export type PurchaseResult =
  | { status: "success"; plan: PlanId | null }
  | { status: "cancelled" }
  /** Store/SDK can't be used right now (no key, web, no offering, offline). */
  | { status: "unavailable" }
  /** Payment is awaiting approval (e.g. Apple "Ask to Buy"). Premium unlocks automatically once approved. */
  | { status: "pending" }
  /** Restore ran fine but the account has no active subscription. */
  | { status: "nothing_to_restore" }
  /** The store charged the user but the entitlement isn't active, which points to a dashboard misconfiguration. */
  | { status: "entitlement_missing" };

export interface PlanPrice {
  /** Localized price string from the store, e.g. "$4.99" or "4,99 €". */
  priceString: string;
  /** Numeric price in the store currency (used to compute the yearly savings badge). */
  price: number;
  /** Localized per-month price, when the store provides it (handy for the yearly plan). */
  pricePerMonthString: string | null;
}

export type PlanPrices = Partial<Record<PlanId, PlanPrice>>;

const API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
  default: undefined,
});

let configured = false;
let packages: Partial<Record<PlanId, PurchasesPackage>> = {};

/* ── Entitlement mirroring ── */

function planFromProductId(productId: string): PlanId | null {
  // Android product ids look like "<subscriptionId>:<basePlanId>", so match on prefix.
  if (productId.startsWith(PREMIUM_PLANS.yearly.productId)) return "yearly";
  if (productId.startsWith(PREMIUM_PLANS.monthly.productId)) return "monthly";
  return null;
}

/** Copies RevenueCat's entitlement state into the local store. Returns whether the user is premium. */
function syncCustomerInfo(info: CustomerInfo): { isPremium: boolean; plan: PlanId | null } {
  const entitlement = info.entitlements.active[PREMIUM_ENTITLEMENT_ID];
  const isPremium = entitlement !== undefined;
  const plan = entitlement ? planFromProductId(entitlement.productIdentifier) : null;
  usePremiumStore.getState().setEntitlement(isPremium, plan);
  return { isPremium, plan };
}

/** Re-reads the subscription state from RevenueCat (which caches, so this works offline too). */
export async function refreshEntitlement(): Promise<void> {
  if (!configured) return;
  try {
    syncCustomerInfo(await Purchases.getCustomerInfo());
  } catch {
    // Keep whatever we last knew; the next app foreground will retry.
  }
}

/* ── Setup ── */

/**
 * Configures the SDK once. Safe to call repeatedly. Returns false (and the app simply stays on the
 * free tier) when billing can't run: web, Expo Go without a key, or a missing env var.
 */
export function initPurchases(): boolean {
  if (configured) return true;
  if (!API_KEY) {
    if (__DEV__) {
      console.warn(
        "[purchases] No RevenueCat API key for this platform. Set EXPO_PUBLIC_REVENUECAT_IOS_API_KEY / " +
          "EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY. Running in free mode.",
      );
    }
    return false;
  }

  try {
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey: API_KEY });
    // Fires on renewals, expirations, refunds and purchases made on another device.
    Purchases.addCustomerInfoUpdateListener(syncCustomerInfo);
    AppState.addEventListener("change", (state) => {
      if (state === "active") void refreshEntitlement();
    });
    configured = true;
    void refreshEntitlement();
    return true;
  } catch (error) {
    if (__DEV__) console.warn("[purchases] configure failed", error);
    return false;
  }
}

/* ── Offerings / prices ── */

function toPlanPrice(pkg: PurchasesPackage): PlanPrice {
  return {
    priceString: pkg.product.priceString,
    price: pkg.product.price,
    pricePerMonthString: pkg.product.pricePerMonthString,
  };
}

/** Loads the current offering and returns store-localized prices for the paywall. */
export async function loadPlanPrices(): Promise<PlanPrices> {
  if (!initPurchases()) return {};

  const offering = (await Purchases.getOfferings()).current;
  if (!offering) return {};

  const find = (type: PACKAGE_TYPE, plan: PlanId): PurchasesPackage | undefined =>
    offering.availablePackages.find((p) => p.packageType === type) ??
    offering.availablePackages.find((p) => p.product.identifier.startsWith(PREMIUM_PLANS[plan].productId));

  packages = {
    monthly: find(PACKAGE_TYPE.MONTHLY, "monthly"),
    yearly: find(PACKAGE_TYPE.ANNUAL, "yearly"),
  };

  const prices: PlanPrices = {};
  if (packages.monthly) prices.monthly = toPlanPrice(packages.monthly);
  if (packages.yearly) prices.yearly = toPlanPrice(packages.yearly);
  return prices;
}

/* ── Purchase flows used by the paywall ── */

export async function purchasePlan(plan: PlanId): Promise<PurchaseResult> {
  if (!initPurchases()) return { status: "unavailable" };

  if (!packages[plan]) await loadPlanPrices();
  const pkg = packages[plan];
  if (!pkg) return { status: "unavailable" };

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const { isPremium, plan: activePlan } = syncCustomerInfo(customerInfo);
    return isPremium ? { status: "success", plan: activePlan } : { status: "entitlement_missing" };
  } catch (error) {
    const e = error as PurchasesError;
    if (e.userCancelled || e.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { status: "cancelled" };
    }
    if (e.code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) return { status: "pending" };
    throw error;
  }
}

export async function restorePurchases(): Promise<PurchaseResult> {
  if (!initPurchases()) return { status: "unavailable" };

  const { isPremium, plan } = syncCustomerInfo(await Purchases.restorePurchases());
  return isPremium ? { status: "success", plan } : { status: "nothing_to_restore" };
}

/** Opens the system subscription management page (required so users can cancel). */
export function openManageSubscriptions(): Promise<void> {
  return Linking.openURL(
    Platform.OS === "android"
      ? "https://play.google.com/store/account/subscriptions"
      : "https://apps.apple.com/account/subscriptions",
  );
}
