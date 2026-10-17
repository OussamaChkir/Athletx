import { Platform } from "react-native";

/**
 * AdMob configuration: ad unit ids and the frequency rules, in one place.
 *
 * App-level AdMob ids are NOT here; they live in app.json (the react-native-google-mobile-ads plugin)
 * and, for the committed Android project, in android/app/src/main/AndroidManifest.xml.
 *
 * Ad unit ids are public identifiers that ship inside the app binary, so they are safe to commit.
 */

type PlatformUnits = { interstitial: string; rewarded: string } | null;

/**
 * Ads are Android-only for now: these units belong to the Android AdMob app. To enable iOS, create an
 * iOS app and two units in AdMob, fill in `ios` below, and replace the sample `iosAppId` in app.json.
 */
const AD_UNITS: Record<"android" | "ios", PlatformUnits> = {
  android: {
    /** AdMob unit "athletx_workout_interstitial" */
    interstitial: "ca-app-pub-8362632054070515/4668439442",
    /** AdMob unit "athletx_prepared_workout_rewarded" */
    rewarded: "ca-app-pub-8362632054070515/7363630400",
  },
  ios: null,
};

/** The units for the platform we're running on, or null where ads are not supported (iOS, web). */
export const PLATFORM_AD_UNITS: PlatformUnits =
  Platform.OS === "android" || Platform.OS === "ios" ? AD_UNITS[Platform.OS] : null;

/** True when this platform has ad units configured. When false, every ad entry point is a no-op. */
export const ADS_SUPPORTED = PLATFORM_AD_UNITS !== null;

/**
 * Serve Google's test ads instead of live ones. Always on in development builds; opt in for release
 * builds with EXPO_PUBLIC_ADMOB_TEST_ADS=true (the EAS `preview` profile does). Tapping live ads on
 * your own device is invalid traffic and can get the AdMob account suspended.
 */
export const USE_TEST_ADS = __DEV__ || process.env.EXPO_PUBLIC_ADMOB_TEST_ADS === "true";

export type InterstitialPlacement = "workout_complete" | "workout_exit";

/** Frequency rules for interstitials. Premium users never see ads (see `adsAvailable` in ./index). */
export const INTERSTITIAL_RULES = {
  /** Workouts the user must have completed before the current session can show an ad (1 = their first workout is ad-free). */
  freeWorkouts: 1,
  /** Minimum gap between two interstitials. */
  minIntervalMs: 5 * 60 * 1000,
  /** Hard cap per local calendar day, across both placements. */
  maxPerDay: 3,
  /** Leaving a workout early only counts as an ad moment after real effort in the session. */
  exitMinSets: 3,
  exitMinSeconds: 5 * 60,
} as const;

/** Fullscreen ads expire after about an hour; never show one older than this, load a fresh one instead. */
export const AD_MAX_AGE_MS = 50 * 60 * 1000;

/** How long watching a rewarded ad unlocks a locked prepared workout. */
export const REWARDED_UNLOCK_MS = 24 * 60 * 60 * 1000;
