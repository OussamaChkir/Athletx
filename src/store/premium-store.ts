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
  setPremium: (plan: PlanId | null) => void;
  setHasHydrated: (val: boolean) => void;
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set) => ({
      isPremium: false,
      activePlan: null,
      hasHydrated: false,

      setPremium: (plan) => set({ isPremium: plan !== null, activePlan: plan }),
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
