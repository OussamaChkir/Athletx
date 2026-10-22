/**
 * Sources and wording for the health information shown in the app (BMI and weight-goal guidance).
 * App Store guideline 1.4.1 requires citations for health/medical information that users can easily find.
 */

export interface HealthSource {
  title: string;
  publisher: string;
  /** What in the app this source backs. */
  covers: string;
  url: string;
}

export const HEALTH_SOURCES: HealthSource[] = [
  {
    title: "Obesity and overweight (fact sheet)",
    publisher: "World Health Organization (WHO)",
    covers: "Adult BMI definition and classification (overweight 25+, obesity 30+).",
    url: "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight",
  },
  {
    title: "Adult BMI Categories",
    publisher: "U.S. Centers for Disease Control and Prevention (CDC)",
    covers: "Adult BMI ranges: underweight, healthy weight, overweight, obesity.",
    url: "https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html",
  },
  {
    title: "Child and Teen BMI Categories",
    publisher: "U.S. Centers for Disease Control and Prevention (CDC)",
    covers: "Why BMI for people under 18 is read as an age- and sex-specific percentile.",
    url: "https://www.cdc.gov/bmi/child-teen-calculator/bmi-categories.html",
  },
];

export const BMI_FORMULA = "BMI = weight (kg) ÷ height (m)²";

export const HEALTH_DISCLAIMER =
  "BMI is a general screening estimate. It does not measure body fat or muscle mass and is not a diagnosis. " +
  "The information in Athletx is for general fitness purposes only and is not medical advice. " +
  "Talk to a doctor or other qualified healthcare professional before starting a new exercise or nutrition " +
  "program, or if you have questions about your health.";

export type BmiCategory = "underweight" | "healthy" | "overweight" | "obese";

/** Adult cut-offs from WHO / CDC: <18.5, 18.5-24.9, 25-29.9, 30+. */
export function adultBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "healthy";
  if (bmi < 30) return "overweight";
  return "obese";
}

export const BMI_CATEGORY_TEXT: Record<BmiCategory, string> = {
  underweight: "Underweight range (BMI below 18.5).",
  healthy: "Healthy weight range (BMI 18.5 to 24.9).",
  overweight: "Overweight range (BMI 25 to 29.9).",
  obese: "Obesity range (BMI 30 or above).",
};

/** Shown instead of an adult category when the user is under 18 (adult cut-offs do not apply). */
export const MINOR_BMI_TEXT =
  "For people under 18, BMI is interpreted as a percentile for age and sex, so adult categories don't apply. " +
  "A doctor can tell you what your BMI means for you.";

/** True when adult BMI categories should not be shown for this age. */
export function isUnderAdultAge(age: number | null): boolean {
  return age !== null && age < 18;
}
