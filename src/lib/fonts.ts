import { useFonts } from "expo-font";
import { Jost_400Regular, Jost_500Medium } from "@expo-google-fonts/jost";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";

/** Only the weights used by the design system are bundled (see `fonts` in theme.ts). */
const fontAssets = {
  Jost_400Regular,
  Jost_500Medium,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
};

/** Loads Jost and Plus Jakarta Sans. Returns `[loaded, error]` like expo-font's `useFonts`. */
export function useAppFonts() {
  return useFonts(fontAssets);
}
