import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createId } from "@/lib/id";
import { localDateKey, roundWeight } from "@/lib/weight";

export interface WeighIn {
  id: string;
  /** Local calendar date YYYY-MM-DD */
  date: string;
  /** Canonical mass in kilograms */
  kg: number;
  createdAt: string;
}

interface WeightLogState {
  entries: WeighIn[];
  seededFromProfile: boolean;
  logWeight: (kg: number, date?: string) => void;
  deleteEntry: (id: string) => void;
  seedFromProfile: (kg: number) => void;
}

function sortEntries(entries: WeighIn[]): WeighIn[] {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date));
}

export const useWeightStore = create<WeightLogState>()(
  persist(
    (set, get) => ({
      entries: [],
      seededFromProfile: false,

      logWeight: (kg, date = localDateKey()) => {
        const value = roundWeight(kg, 2);
        const now = new Date().toISOString();
        const existing = get().entries.find((e) => e.date === date);
        if (existing) {
          set({
            entries: sortEntries(
              get().entries.map((e) =>
                e.date === date ? { ...e, kg: value, createdAt: now } : e
              )
            ),
          });
          return;
        }
        set({
          entries: sortEntries([
            ...get().entries,
            { id: createId(), date, kg: value, createdAt: now },
          ]),
        });
      },

      deleteEntry: (id) =>
        set({ entries: get().entries.filter((e) => e.id !== id) }),

      seedFromProfile: (kg) => {
        if (get().seededFromProfile || get().entries.length > 0) return;
        const value = roundWeight(kg, 2);
        if (!(value > 0)) {
          set({ seededFromProfile: true });
          return;
        }
        set({
          seededFromProfile: true,
          entries: [
            {
              id: createId(),
              date: localDateKey(),
              kg: value,
              createdAt: new Date().toISOString(),
            },
          ],
        });
      },
    }),
    {
      name: "athletx-weight-log",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
