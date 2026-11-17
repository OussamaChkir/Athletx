import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useOnboardingStore } from "@/store/onboarding-store";
import { HealthSourcesLink } from "@/components/health-sources";
import { InfoCard } from "@/components/onboarding/InfoCard";
import { StepTitle } from "@/components/onboarding/StepTitle";
import { ValueRuler } from "@/components/onboarding/ValueRuler";
import { WEIGHT_RULERS } from "@/components/onboarding/ruler-configs";
import { colors, theme } from "@/lib/theme";

export default function StepGoalWeight() {
  const { t } = useTranslation("onboarding");
  const { weight, goalWeight, setField } = useOnboardingStore();

  const diffPerc = weight.value && goalWeight ? ((goalWeight - weight.value) / weight.value) * 100 : null;

  let diffLabel = "";
  let diffMsg = "";
  let diffColor: string = colors.accent;
  if (diffPerc !== null) {
    if (diffPerc < -15) {
      diffMsg = t("goalWeight.loseLarge", { pct: Math.abs(diffPerc).toFixed(1) });
      diffColor = theme.ember;
    } else if (diffPerc < 0) {
      diffMsg = t("goalWeight.loseModerate", { pct: Math.abs(diffPerc).toFixed(1) });
    } else if (diffPerc > 15) {
      diffMsg = t("goalWeight.gainLarge", { pct: diffPerc.toFixed(1) });
      diffColor = theme.ember;
    } else if (diffPerc > 0) {
      diffMsg = t("goalWeight.gainModerate", { pct: diffPerc.toFixed(1) });
    } else {
      diffMsg = t("goalWeight.maintain");
    }
    diffLabel = diffPerc > 0 ? t("goalWeight.targetGain") : diffPerc < 0 ? t("goalWeight.targetLoss") : t("goalWeight.maintenance");
  }

  return (
    <View style={styles.root}>
      <StepTitle title={t("goalWeight.title")} highlight={t("goalWeight.highlight")} subtitle={t("goalWeight.subtitle")} />
      <View style={styles.center}>
        <ValueRuler
          key={weight.unit}
          config={WEIGHT_RULERS[weight.unit]}
          value={goalWeight}
          initial={weight.value ?? undefined}
          onCommit={(v) => setField("goalWeight", v)}
        />
      </View>

      {diffPerc !== null && (
        <InfoCard label={diffLabel} message={diffMsg} tone={diffColor}>
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
