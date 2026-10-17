import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PlanId } from "@/lib/premium";

export interface PremiumState {
  /** Whether the user currently has an active Athletx Premium subscription. */
  isPremium: boolean;
  /** Plan the user is subscribed to, if any. */
  activePlan: PlanId | null;
  /** True once persisted state has been loaded from storage. */
  hasHydrated: boolean;

  /* Actions */
  /** Mirrors RevenueCat's entitlement state. RevenueCat is the source of truth; this is a local cache. */
  setEntitlement: (isPremium: boolean, plan: PlanId | null) => void;
  setHasHydrated: (val: boolean) => void;
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set) => ({
      isPremium: false,
      activePlan: null,
      hasHydrated: false,

      setEntitlement: (isPremium, plan) => set({ isPremium, activePlan: isPremium ? plan : null }),
      setHasHydrated: (val) => set({ hasHydrated: val }),
    }),
    {
      name: "athletx-premium-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ isPremium: state.isPremium, activePlan: state.activePlan }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
