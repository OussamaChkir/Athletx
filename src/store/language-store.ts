import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { applyLanguageSetting } from "@/i18n";
import type { LanguageSetting } from "@/i18n/languages";

interface LanguageState {
  setting: LanguageSetting;
  setSetting: (setting: LanguageSetting) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      setting: "auto",
      setSetting: (setting) => {
        set({ setting });
        applyLanguageSetting(setting);
      },
    }),
    {
      name: "athletx-language-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ setting: state.setting }),
      // Apply the saved choice as soon as it has been read from storage.
      onRehydrateStorage: () => (state) => {
        if (state) applyLanguageSetting(state.setting);
      },
    },
  ),
);
