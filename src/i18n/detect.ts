import { getLocales } from "expo-localization";
import { isSupportedLanguage, languageForRegion, type Language } from "./languages";

/**
 * The language the app should open in when the user has not chosen one.
 *
 * 1. The first language in the phone's preference list that we translate (iOS/Android keep this ordered).
 * 2. Otherwise the language of the phone's region (Tunisia → French, Mexico → Spanish, ...).
 * 3. Otherwise English.
 */
export function detectDeviceLanguage(): Language {
  try {
    const locales = getLocales();
    for (const locale of locales) {
      if (isSupportedLanguage(locale.languageCode)) return locale.languageCode;
    }
    for (const locale of locales) {
      const fromRegion = languageForRegion(locale.regionCode);
      if (fromRegion) return fromRegion;
    }
  } catch {
    // Fall through to English.
  }
  return "en";
}
