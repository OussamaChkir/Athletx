import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import { detectDeviceLanguage } from "./detect";
import { isSupportedLanguage, type Language, type LanguageSetting } from "./languages";

import enCommon from "./locales/en/common.json";
import enExercises from "./locales/en/exercises.json";
import enHome from "./locales/en/home.json";
import enLibrary from "./locales/en/library.json";
import enOnboarding from "./locales/en/onboarding.json";
import enPlan from "./locales/en/plan.json";
import enPremium from "./locales/en/premium.json";
import enProfile from "./locales/en/profile.json";
import enPrograms from "./locales/en/programs.json";
import enProgress from "./locales/en/progress.json";
import enSettings from "./locales/en/settings.json";
import enWorkout from "./locales/en/workout.json";

import frCommon from "./locales/fr/common.json";
import frExercises from "./locales/fr/exercises.json";
import frHome from "./locales/fr/home.json";
import frLibrary from "./locales/fr/library.json";
import frOnboarding from "./locales/fr/onboarding.json";
import frPlan from "./locales/fr/plan.json";
import frPremium from "./locales/fr/premium.json";
import frProfile from "./locales/fr/profile.json";
import frPrograms from "./locales/fr/programs.json";
import frProgress from "./locales/fr/progress.json";
import frSettings from "./locales/fr/settings.json";
import frWorkout from "./locales/fr/workout.json";

import esCommon from "./locales/es/common.json";
import esExercises from "./locales/es/exercises.json";
import esHome from "./locales/es/home.json";
import esLibrary from "./locales/es/library.json";
import esOnboarding from "./locales/es/onboarding.json";
import esPlan from "./locales/es/plan.json";
import esPremium from "./locales/es/premium.json";
import esProfile from "./locales/es/profile.json";
import esPrograms from "./locales/es/programs.json";
import esProgress from "./locales/es/progress.json";
import esSettings from "./locales/es/settings.json";
import esWorkout from "./locales/es/workout.json";

export const NAMESPACES = [
  "common",
  "home",
  "library",
  "exercises",
  "plan",
  "workout",
  "progress",
  "settings",
  "profile",
  "premium",
  "onboarding",
  "programs",
] as const;
export type Namespace = (typeof NAMESPACES)[number];

const resources = {
  en: {
    common: enCommon, home: enHome, library: enLibrary, exercises: enExercises, plan: enPlan, workout: enWorkout,
    progress: enProgress, settings: enSettings, profile: enProfile, premium: enPremium, onboarding: enOnboarding,
    programs: enPrograms,
  },
  fr: {
    common: frCommon, home: frHome, library: frLibrary, exercises: frExercises, plan: frPlan, workout: frWorkout,
    progress: frProgress, settings: frSettings, profile: frProfile, premium: frPremium, onboarding: frOnboarding,
    programs: frPrograms,
  },
  es: {
    common: esCommon, home: esHome, library: esLibrary, exercises: esExercises, plan: esPlan, workout: esWorkout,
    progress: esProgress, settings: esSettings, profile: esProfile, premium: esPremium, onboarding: esOnboarding,
    programs: esPrograms,
  },
};

void i18n.use(initReactI18next).init({
  resources,
  lng: detectDeviceLanguage(),
  fallbackLng: "en",
  ns: [...NAMESPACES],
  defaultNS: "common",
  interpolation: { escapeValue: false }, // React Native does not render HTML
  initAsync: false, // resources are bundled: initialise synchronously so the first render is already translated
});

/** Switch the app language: "auto" follows the phone (language list, then region). */
export function applyLanguageSetting(setting: LanguageSetting) {
  const next: Language = setting === "auto" ? detectDeviceLanguage() : setting;
  if (i18n.language !== next) void i18n.changeLanguage(next);
}

/** The language currently shown. Always one of en / fr / es. */
export function currentLanguage(): Language {
  return isSupportedLanguage(i18n.language) ? i18n.language : "en";
}

/** Re-renders the component when the language changes and gives it the language code. */
export function useLanguage(): Language {
  const { i18n: instance } = useTranslation();
  return isSupportedLanguage(instance.language) ? instance.language : "en";
}

/** Locale tag for Intl / toLocaleDateString / toLocaleString, e.g. "fr-FR". */
export function intlLocale(language: Language = currentLanguage()): string {
  return { en: "en-US", fr: "fr-FR", es: "es-ES" }[language];
}

export default i18n;
