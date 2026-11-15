export const SUPPORTED_LANGUAGES = ["en", "fr", "es"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/** What the user picked in Settings: a language, or "auto" to follow the phone. */
export type LanguageSetting = "auto" | Language;

/** Each language written in itself, so a user can always find theirs. */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
};

export const isSupportedLanguage = (value: string | null | undefined): value is Language =>
  !!value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

/**
 * Region → language, used only when none of the phone's preferred languages is one we have.
 * e.g. an Arabic-language phone in Tunisia or a Portuguese-language phone in Mexico.
 */
const FRENCH_REGIONS = new Set([
  "FR", "BE", "LU", "MC", "CH", "CA", "TN", "DZ", "MA", "SN", "CI", "CM", "ML", "BF", "NE", "TG", "BJ", "GN",
  "MG", "CD", "CG", "GA", "HT", "DJ", "RW", "BI", "GP", "MQ", "GF", "RE", "YT", "NC", "PF", "LB", "MR",
]);
const SPANISH_REGIONS = new Set([
  "ES", "MX", "AR", "CO", "CL", "PE", "VE", "EC", "GT", "CU", "BO", "DO", "HN", "PY", "SV", "NI", "CR", "PA",
  "UY", "PR", "GQ",
]);

export function languageForRegion(region: string | null | undefined): Language | null {
  const code = region?.toUpperCase();
  if (!code) return null;
  if (FRENCH_REGIONS.has(code)) return "fr";
  if (SPANISH_REGIONS.has(code)) return "es";
  return null;
}
