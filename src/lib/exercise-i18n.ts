import { currentLanguage } from "@/i18n";
import type { Language } from "@/i18n/languages";
import { getExerciseById } from "./exercises";
import fr1 from "@/data/i18n/exercises.fr.1.json";
import fr2 from "@/data/i18n/exercises.fr.2.json";
import es1 from "@/data/i18n/exercises.es.1.json";
import es2 from "@/data/i18n/exercises.es.2.json";

type ExerciseText = { title: string; steps: string[] };
type ExerciseTexts = Record<string, ExerciseText>;

/** Exercise names and instructions per language, keyed by the exercise `_id`. English lives in exercises.json. */
const TEXTS: Partial<Record<Language, ExerciseTexts>> = {
  fr: { ...(fr1 as ExerciseTexts), ...(fr2 as ExerciseTexts) },
  es: { ...(es1 as ExerciseTexts), ...(es2 as ExerciseTexts) },
};

/**
 * Exercise name in the current language.
 * Logged workouts and plans keep a copy of the English title, so always look it up by id when showing it.
 * Components that call this must also call `useTranslation()` / `useLanguage()` so they re-render on a language change.
 */
export function exerciseTitle(exerciseId: string, fallback?: string): string {
  return TEXTS[currentLanguage()]?.[exerciseId]?.title ?? fallback ?? getExerciseById(exerciseId)?.title ?? "";
}

/** Exercise instructions in the current language (falls back to the English steps). */
export function exerciseSteps(exerciseId: string, fallback?: string[]): string[] {
  return TEXTS[currentLanguage()]?.[exerciseId]?.steps ?? fallback ?? getExerciseById(exerciseId)?.steps ?? [];
}

/** All the names an exercise goes by (current language + English), lowercased, for search. */
export function exerciseSearchText(exerciseId: string, englishTitle: string): string {
  const local = TEXTS[currentLanguage()]?.[exerciseId]?.title;
  return `${englishTitle} ${local ?? ""}`.toLowerCase();
}
