import { Platform } from "react-native";
import type * as AdsSdkModule from "react-native-google-mobile-ads";
import { useAdsStore, todayKey, type RewardedStatus } from "@/store/ads-store";
import { usePremiumStore } from "@/store/premium-store";
import { useWorkoutStore } from "@/store/workout-store";
import {
  ADS_SUPPORTED,
  AD_MAX_AGE_MS,
  INTERSTITIAL_RULES,
  PLATFORM_AD_UNITS,
  REWARDED_UNLOCK_MS,
  USE_TEST_ADS,
  type InterstitialPlacement,
} from "./config";

export { ADS_SUPPORTED, REWARDED_UNLOCK_MS, type InterstitialPlacement } from "./config";

/**
 * AdMob integration (react-native-google-mobile-ads).
 *
 * - Interstitial: shown at natural transitions after a workout. Never blocks: if no ad is loaded, or the
 *   frequency rules say no, the caller's continuation runs immediately.
 * - Rewarded: shown only after the user taps "Watch an ad to unlock". The unlock is written from the SDK's
 *   earned-reward callback and nowhere else.
 * - Premium users never load or see ads.
 *
 * Ads only run on platforms with units configured (see ./config); everywhere else this module is inert.
 */

type AdsSdk = typeof AdsSdkModule;
type Kind = "interstitial" | "rewarded";

/** The slice of the SDK's ad classes this module uses, shared by interstitial and rewarded ads. */
interface FullscreenAd {
  load(): void;
  show(): Promise<void>;
  destroy(): void;
  addAdEventListener(type: string, listener: (payload?: unknown) => void): () => void;
}

/** Delay before an automatic retry after a failed load (multiplied by the attempt number). */
const RETRY_DELAY_MS = 15_000;

/* ── SDK access ── */

let sdk: AdsSdk | null | undefined;

function getSdk(): AdsSdk | null {
  if (sdk !== undefined) return sdk;
  sdk = null;
  if (!ADS_SUPPORTED) return sdk;
  try {
    // Loaded lazily so web and iOS bundles never evaluate the native module.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    sdk = require("react-native-google-mobile-ads") as AdsSdk;
  } catch {
    sdk = null; // e.g. a binary built before the package was added
  }
  return sdk;
}

/** Ads can run: supported platform, SDK present in this binary, and the user isn't Premium. */
function adsAvailable(): boolean {
  return getSdk() !== null && !usePremiumStore.getState().isPremium;
}

function unitIdFor(kind: Kind, s: AdsSdk): string | null {
  if (USE_TEST_ADS) return kind === "interstitial" ? s.TestIds.INTERSTITIAL : s.TestIds.REWARDED;
  return PLATFORM_AD_UNITS?.[kind] ?? null;
}

function createAd(s: AdsSdk, kind: Kind, unitId: string): FullscreenAd {
  const ad =
    kind === "interstitial"
      ? s.InterstitialAd.createForAdRequest(unitId)
      : s.RewardedAd.createForAdRequest(unitId);
  return ad as unknown as FullscreenAd;
}

/* ── Initialization & consent ── */

let initPromise: Promise<boolean> | null = null;

/**
 * iOS App Tracking Transparency: shows Apple's system prompt the first time (the text comes from
 * NSUserTrackingUsageDescription, set in app.json). Must run before the ad SDK collects any data used to
 * track the user. Never throws; if the user declines or the prompt can't be shown, ads are still served
 * (non-personalized) and the app works the same.
 */
async function requestTrackingPermission(): Promise<void> {
  if (Platform.OS !== "ios") return;
  try {
    // Loaded lazily so a binary built before the package was added doesn't crash at import time.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const att = require("expo-tracking-transparency") as typeof import("expo-tracking-transparency");
    const { status, canAskAgain } = await att.getTrackingPermissionsAsync();
    if (status === att.PermissionStatus.UNDETERMINED && canAskAgain) {
      await att.requestTrackingPermissionsAsync();
    }
  } catch {
    // Continue without tracking permission; the SDK then treats the user as not having granted it.
  }
}

/**
 * Asks for tracking permission (iOS), gathers consent (Google's UMP form, shown only where required,
 * e.g. EEA/UK), then starts the SDK.
 * Safe to call repeatedly: concurrent calls share one run, and a failed run is retried on the next call.
 * Resolves to whether ads can be requested.
 */
export function initAds(): Promise<boolean> {
  const s = getSdk();
  if (!s) return Promise.resolve(false);
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // ATT must be answered before consent gathering and SDK start (Apple guideline 5.1.2(i)).
    await requestTrackingPermission();

    let canRequestAds = false;
    try {
      canRequestAds = (await s.AdsConsent.gatherConsent()).canRequestAds;
    } catch {
      // Offline or the form failed: fall back to whatever consent state is already stored.
      try {
        canRequestAds = (await s.AdsConsent.getConsentInfo()).canRequestAds;
      } catch {
        canRequestAds = false;
      }
    }
    if (!canRequestAds) return false;

    await s.default().initialize();
    if (adsAvailable()) interstitialSlot.load();
    return true;
  })()
    .catch(() => false)
    .then((ready) => {
      if (!ready) initPromise = null;
      return ready;
    });

  return initPromise;
}

/* ── One preloaded ad per format ── */

class AdSlot {
  private readonly kind: Kind;
  private readonly maxAutoRetries: number;
  private readonly onStatus?: (status: RewardedStatus) => void;

  private ad: FullscreenAd | null = null;
  private loadedAt: number | null = null;
  private loading = false;
  private retries = 0;
  private unsubscribe: (() => void)[] = [];

  constructor(kind: Kind, maxAutoRetries: number, onStatus?: (status: RewardedStatus) => void) {
    this.kind = kind;
    this.maxAutoRetries = maxAutoRetries;
    this.onStatus = onStatus;
  }

  /** A loaded ad that is still fresh enough to show. */
  get isReady(): boolean {
    return this.ad !== null && this.loadedAt !== null && Date.now() - this.loadedAt < AD_MAX_AGE_MS;
  }

  /** Loads a fresh ad unless one is already loading or still fresh. Requires `initAds()` to have succeeded. */
  load(): void {
    const s = getSdk();
    const unitId = s ? unitIdFor(this.kind, s) : null;
    if (!s || !unitId || !adsAvailable() || this.loading || this.isReady) return;

    this.discard(); // clears an expired ad, if any
    this.loading = true;
    this.onStatus?.("loading");

    try {
      const ad = createAd(s, this.kind, unitId);
      this.ad = ad;
      this.unsubscribe = [
        ad.addAdEventListener(
          this.kind === "interstitial" ? s.AdEventType.LOADED : s.RewardedAdEventType.LOADED,
          () => {
            if (this.ad !== ad) return;
            this.loading = false;
            this.loadedAt = Date.now();
            this.retries = 0;
            this.onStatus?.("ready");
          },
        ),
        ad.addAdEventListener(s.AdEventType.ERROR, () => {
          if (this.ad !== ad) return;
          this.failed();
        }),
      ];
      ad.load();
    } catch {
      this.failed();
    }
  }

  /** Hands over a ready ad, or null. The slot is left empty; the caller owns the ad from here on. */
  take(): FullscreenAd | null {
    if (!this.isReady || this.ad === null) return null;
    const ad = this.ad;
    this.unsubscribe.forEach((off) => off());
    this.unsubscribe = [];
    this.ad = null;
    this.loadedAt = null;
    this.loading = false;
    this.onStatus?.("idle");
    return ad;
  }

  private failed(): void {
    this.discard();
    this.onStatus?.("unavailable");
    if (this.retries < this.maxAutoRetries) {
      this.retries += 1;
      setTimeout(() => this.load(), RETRY_DELAY_MS * this.retries);
    }
  }

  private discard(): void {
    this.unsubscribe.forEach((off) => off());
    this.unsubscribe = [];
    this.ad?.destroy();
    this.ad = null;
    this.loadedAt = null;
    this.loading = false;
  }
}

const interstitialSlot = new AdSlot("interstitial", 2);
const rewardedSlot = new AdSlot("rewarded", 0, (status) => useAdsStore.getState().setRewardedStatus(status));

/** Shows a taken ad and resolves once it closes or fails to show. Destroys the ad and loads the next one. */
function present(
  s: AdsSdk,
  slot: AdSlot,
  ad: FullscreenAd,
  hooks: { onOpened?: () => void; onEarned?: () => void } = {},
): Promise<{ shown: boolean; earned: boolean }> {
  return new Promise((resolve) => {
    let earned = false;
    let settled = false;
    const unsubscribe: (() => void)[] = [];

    const finish = (shown: boolean) => {
      if (settled) return;
      settled = true;
      unsubscribe.forEach((off) => off());
      ad.destroy();
      slot.load();
      resolve({ shown, earned });
    };

    unsubscribe.push(ad.addAdEventListener(s.AdEventType.OPENED, () => hooks.onOpened?.()));
    unsubscribe.push(ad.addAdEventListener(s.AdEventType.CLOSED, () => finish(true)));
    // Failures while showing arrive as ERROR (the SDK has no separate "show failed" event).
    unsubscribe.push(ad.addAdEventListener(s.AdEventType.ERROR, () => finish(false)));
    if (hooks.onEarned) {
      unsubscribe.push(
        ad.addAdEventListener(s.RewardedAdEventType.EARNED_REWARD, () => {
          earned = true;
          hooks.onEarned?.();
        }),
      );
    }

    ad.show().catch(() => finish(false));
  });
}

/* ── Interstitial ── */

/** Starts loading the interstitial so it's ready at the next natural transition. No-op if one is ready. */
export function preloadInterstitial(): void {
  if (!adsAvailable()) return;
  void initAds().then((ready) => {
    if (ready) interstitialSlot.load();
  });
}

function interstitialAllowed(placement: InterstitialPlacement): boolean {
  if (!adsAvailable()) return false;

  const { lastInterstitialAt, interstitialDay, interstitialCountToday } = useAdsStore.getState();
  if (Date.now() - lastInterstitialAt < INTERSTITIAL_RULES.minIntervalMs) return false;
  if (interstitialDay === todayKey() && interstitialCountToday >= INTERSTITIAL_RULES.maxPerDay) return false;

  // On completion the workout is already saved (so it's in history); on an early exit it is not.
  const completed = useWorkoutStore.getState().history.length;
  const priorCompleted = placement === "workout_complete" ? completed - 1 : completed;
  return priorCompleted >= INTERSTITIAL_RULES.freeWorkouts;
}

/** Whether a session had enough effort that leaving it early can be an ad moment. */
export function isMeaningfulSession(loggedSets: number, elapsedSeconds: number): boolean {
  return loggedSets >= INTERSTITIAL_RULES.exitMinSets && elapsedSeconds >= INTERSTITIAL_RULES.exitMinSeconds;
}

/**
 * Shows an interstitial if the rules allow it and one is loaded, then calls `onContinue` once it closes.
 * If nothing can be shown, `onContinue` runs immediately, so the user is never held up by an ad.
 * Save any progress BEFORE calling this.
 */
export function showInterstitialThen(placement: InterstitialPlacement, onContinue: () => void): void {
  const s = getSdk();
  const ad = s && interstitialAllowed(placement) ? interstitialSlot.take() : null;

  if (!s || !ad) {
    preloadInterstitial();
    onContinue();
    return;
  }

  present(s, interstitialSlot, ad, {
    onOpened: () => useAdsStore.getState().recordInterstitialShown(),
  }).then(
    () => onContinue(),
    () => onContinue(),
  );
}

/* ── Rewarded ── */

/** Reactive status of the rewarded ad, for the "Watch an ad to unlock" button. */
export function useRewardedStatus(): RewardedStatus {
  return useAdsStore((state) => state.rewardedStatus);
}

/** Starts (or retries) loading the rewarded ad. No-op if one is ready or already loading. */
export function preloadRewarded(): void {
  if (!adsAvailable()) return;
  void initAds().then((ready) => {
    if (ready) rewardedSlot.load();
    else useAdsStore.getState().setRewardedStatus("unavailable");
  });
}

export type RewardedResult =
  /** The user watched enough to earn the reward; the workout is unlocked. */
  | "earned"
  /** The ad was shown but closed before the reward was earned. Nothing is unlocked. */
  | "not_earned"
  /** No ad could be shown (not loaded, no fill, show failed). Nothing is unlocked. */
  | "unavailable";

/**
 * Shows the rewarded ad for a locked prepared workout. Call only from the user's tap on the unlock button.
 * The workout is unlocked from the SDK's earned-reward callback, never from the ad merely closing.
 */
export async function showRewardedForWorkout(workoutId: string): Promise<RewardedResult> {
  const s = getSdk();
  const ad = s && adsAvailable() ? rewardedSlot.take() : null;
  if (!s || !ad) {
    preloadRewarded();
    return "unavailable";
  }

  try {
    const { shown, earned } = await present(s, rewardedSlot, ad, {
      onEarned: () => useAdsStore.getState().unlockWorkout(workoutId, REWARDED_UNLOCK_MS),
    });
    if (earned) return "earned";
    return shown ? "not_earned" : "unavailable";
  } catch {
    return "unavailable";
  }
}
