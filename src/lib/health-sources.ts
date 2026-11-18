import i18n from "@/i18n";

/**
 * Sources and wording for the health information shown in the app (BMI and weight-goal guidance).
 * App Store guideline 1.4.1 requires citations for health/medical information that users can easily find.
 */

export type HealthSourceId = "who" | "cdcAdult" | "cdcChild";

export interface HealthSource {
  id: HealthSourceId;
  url: string;
}

/** Title, publisher and "covers" text live in the settings namespace: settings:health.sourceList.<id>.* */
export const HEALTH_SOURCES: HealthSource[] = [
  {
    id: "who",
    url: "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight",
  },
  {
    id: "cdcAdult",
    url: "https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html",
  },
  {
    id: "cdcChild",
    url: "https://www.cdc.gov/bmi/child-teen-calculator/bmi-categories.html",
  },
];

/** Translated at call time; the calling component must use useTranslation() so it re-renders on language change. */
export const bmiFormula = () => i18n.t("settings:health.formula");
export const healthDisclaimer = () => i18n.t("settings:health.disclaimer");
export const minorBmiText = () => i18n.t("settings:health.minorBmi");
export const bmiCategoryText = (category: BmiCategory) => i18n.t(`settings:health.bmiCategory.${category}`);

export type BmiCategory = "underweight" | "healthy" | "overweight" | "obese";

/** Adult cut-offs from WHO / CDC: <18.5, 18.5-24.9, 25-29.9, 30+. */
export function adultBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "healthy";
  if (bmi < 30) return "overweight";
  return "obese";
}

/** Translated on access (getters), so `BMI_CATEGORY_TEXT[category]` follows the current language. */
export const BMI_CATEGORY_TEXT: Record<BmiCategory, string> = {
  get underweight() {
    return bmiCategoryText("underweight");
  },
  get healthy() {
    return bmiCategoryText("healthy");
  },
  get overweight() {
    return bmiCategoryText("overweight");
  },
  get obese() {
    return bmiCategoryText("obese");
  },
};

/**
 * Shown instead of an adult category when the user is under 18 (adult cut-offs do not apply).
 * @deprecated English only. Use `minorBmiText()` so the text follows the current language.
 */
export const MINOR_BMI_TEXT =
  "For people under 18, BMI is interpreted as a percentile for age and sex, so adult categories don't apply. " +
  "A doctor can tell you what your BMI means for you.";

/** True when adult BMI categories should not be shown for this age. */
export function isUnderAdultAge(age: number | null): boolean {
  return age !== null && age < 18;
}
