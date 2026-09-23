import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createId } from "@/lib/id";

function generateUsername(id: string): string {
  const adjectives = ["Iron", "Alpha", "Storm", "Apex", "Elite", "Prime", "Hyper", "Ultra", "Titan", "Viper"];
  const nouns = ["Lifter", "Beast", "Warrior", "Athlete", "Crusher", "Grinder", "Ranger", "Force", "Hunter", "Spark"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const suffix = id.slice(0, 4).toUpperCase();
  return `${adj}${noun}_${suffix}`;
}

export interface ProfileState {
  /** Immutable unique ID generated once on first launch */
  userId: string;
  /** Editable display name */
  displayName: string;
  /** Editable @username handle */
  username: string;
  /** Optional bio */
  bio: string;
  /** Optional avatar URI (local or remote) */
  avatarUri: string | null;
  /** Fitness goal label */
  fitnessGoal: string;
  /** Connected Google account email, null if not connected */
  googleEmail: string | null;
  /** Whether the Google connection is in progress */
  isConnectingGoogle: boolean;
  
  /** Notification settings */
  notificationsEnabled: boolean;
  workoutReminders: boolean;
  hydrationMotivation: boolean;

  /* Actions */
  updateProfile: (fields: Partial<Omit<ProfileState, "userId" | "updateProfile" | "connectGoogle" | "disconnectGoogle" | "isConnectingGoogle">>) => void;
  connectGoogle: (email: string) => void;
  disconnectGoogle: () => void;
  setConnectingGoogle: (val: boolean) => void;
}

const newUserId = createId();
const defaultUsername = generateUsername(newUserId);

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      userId: newUserId,
      displayName: "",
      username: defaultUsername,
      bio: "",
      avatarUri: null,
      fitnessGoal: "Build Muscle",
      googleEmail: null,
      isConnectingGoogle: false,
      notificationsEnabled: false,
      workoutReminders: false,
      hydrationMotivation: false,

      updateProfile: (fields) => set((state) => ({ ...state, ...fields })),
      connectGoogle: (email) => set({ googleEmail: email, isConnectingGoogle: false }),
      disconnectGoogle: () => set({ googleEmail: null }),
      setConnectingGoogle: (val) => set({ isConnectingGoogle: val }),
    }),
    {
      name: "athletx-profile-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
