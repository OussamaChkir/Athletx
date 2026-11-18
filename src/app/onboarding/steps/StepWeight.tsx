import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useOnboardingStore } from "@/store/onboarding-store";
import { HealthSourcesLink } from "@/components/health-sources";
import { InfoCard } from "@/components/onboarding/InfoCard";
import { StepTitle } from "@/components/onboarding/StepTitle";
import { UnitToggle } from "@/components/onboarding/UnitToggle";
import { ValueRuler } from "@/components/onboarding/ValueRuler";
import { WEIGHT_RULERS } from "@/components/onboarding/ruler-configs";
import { AppText } from "@/components/kit";
import {
  BMI_CATEGORY_TEXT,
  adultBmiCategory,
  isUnderAdultAge,
  minorBmiText,
  type BmiCategory,
} from "@/lib/health-sources";
import { colors, theme } from "@/lib/theme";
import { heightToCm, toKg, type BodyWeightUnit } from "@/lib/weight";

const BMI_COLORS: Record<BmiCategory, string> = {
  underweight: theme.ember,
  healthy: colors.accent,
  overweight: theme.ember,
  obese: colors.danger,
};

export default function StepWeight() {
  const { t } = useTranslation("onboarding");
  const { weight, height, age, setField, setWeightUnit } = useOnboardingStore();

  const bmi = (() => {
    if (!weight.value || !height.value) return null;
    const hM = heightToCm(height.value, height.unit) / 100;
    if (hM <= 0) return null;
    return toKg(weight.value, weight.unit) / (hM * hM);
  })();

  // Adult cut-offs (WHO / CDC) don't apply under 18, so no category is shown for minors.
  let bmiMsg = "";
  let bmiColor: string = colors.accent;
  if (bmi) {
    if (isUnderAdultAge(age)) {
      bmiMsg = minorBmiText();
    } else {
      const category = adultBmiCategory(bmi);
      bmiMsg = BMI_CATEGORY_TEXT[category];
      bmiColor = BMI_COLORS[category];
    }
  }

  return (
    <View style={styles.root}>
      <StepTitle title={t("weight.title")} highlight={t("weight.highlight")} subtitle={t("weight.subtitle")} />
      <UnitToggle<BodyWeightUnit>
        options={[
          { value: "kg", label: "KG" },
          { value: "lb", label: "LB" },
        ]}
        value={weight.unit}
        onChange={setWeightUnit}
      />
      <View style={styles.center}>
        <ValueRuler
          key={weight.unit}
          config={WEIGHT_RULERS[weight.unit]}
          value={weight.value}
          onCommit={(v) => setField("weight", { unit: weight.unit, value: v })}
        />
      </View>

      {bmi !== null && (
        <InfoCard label={t("weight.bmiLabel", { bmi: bmi.toFixed(1) })} message={bmiMsg} tone={bmiColor}>
          <AppText variant="caption" color="textSecondary">
            {t("weight.bmiNote")}
          </AppText>
          <HealthSourcesLink />
        </InfoCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { justifyContent: "center", marginBottom: 8 },
});
