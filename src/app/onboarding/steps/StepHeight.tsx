import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useOnboardingStore } from "@/store/onboarding-store";
import { StepTitle } from "@/components/onboarding/StepTitle";
import { UnitToggle } from "@/components/onboarding/UnitToggle";
import { ValueRuler } from "@/components/onboarding/ValueRuler";
import { ftValueToInches, HEIGHT_RULERS, inchesToFtValue } from "@/components/onboarding/ruler-configs";
import type { HeightUnit } from "@/lib/weight";

export default function StepHeight() {
  const { t } = useTranslation("onboarding");
  const { height, setField, setHeightUnit } = useOnboardingStore();
  const unit = height.unit;

  // The ft ruler counts inches; the store keeps feet.inches (5.11).
  const rulerValue = height.value == null ? null : unit === "ft" ? ftValueToInches(height.value) : height.value;
  const commit = (v: number) => setField("height", { unit, value: unit === "ft" ? inchesToFtValue(v) : v });

  return (
    <View style={styles.root}>
      <StepTitle title={t("height.title")} highlight={t("height.highlight")} subtitle={t("height.subtitle")} />
      <UnitToggle<HeightUnit>
        options={[
          { value: "cm", label: "CM" },
          { value: "ft", label: "FT" },
        ]}
        value={unit}
        onChange={setHeightUnit}
      />
      <View style={styles.center}>
        <ValueRuler key={unit} config={HEIGHT_RULERS[unit]} value={rulerValue} onCommit={commit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: "center" },
});
