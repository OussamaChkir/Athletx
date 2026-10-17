# ATHLETX

ATHLETX is a workout planner.

## Subscriptions (RevenueCat)

Premium is sold through RevenueCat (`react-native-purchases`). RevenueCat is the source of truth for
"is this user premium"; the app mirrors it into `src/store/premium-store.ts`.

| | Free | Premium |
|---|---|---|
| Plans | up to 3 in total (the onboarding "Smart Plan" counts) | unlimited |
| Prepared workouts | first 2 in the list | all |

- Limits live in one place: `src/lib/entitlements.ts` (`FREE_MAX_PLANS`, `FREE_PREPARED_WORKOUT_COUNT`).
- Plan limit is also enforced inside the store (`addPlan` returns `false`), so a missed UI check can't bypass it.
- Billing code: `src/lib/purchases.ts`. Paywall: `src/components/premium-popup.tsx`.

### Configuration

- RevenueCat **entitlement id**: `premium`
- Store **product ids**: `athletx_premium_monthly`, `athletx_premium_yearly` (see `src/lib/premium.ts`)
- Offering: the **current** offering must contain a Monthly and an Annual package
- Env vars (see `.env.example`): `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`.
  For EAS builds set them as EAS environment variables; `.env` is gitignored and is not uploaded.

Billing is a native module, so it does not run in Expo Go. Use an EAS development build
(`eas build --profile development --platform ios`). Without a key the app runs in free mode.
