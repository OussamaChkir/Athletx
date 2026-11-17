import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useOnboardingStore } from "@/store/onboarding-store";
import { NumberPicker } from "@/components/onboarding/NumberPicker";
import { RecommendationCard } from "@/components/onboarding/RecommendationCard";
import { StepTitle } from "@/components/onboarding/StepTitle";

export default function StepTargetFrequency() {
  const { t } = useTranslation("onboarding");
  const { targetFrequency, experience, goal, setField } = useOnboardingStore();

  const suggested = (() => {
    let base = 3;
    if (experience === "intermediate") base = 4;
    if (experience === "advanced") base = 5;

    if (goal === "build_muscle") base += 1;
    if (goal === "maintain") base -= 1;
    if (goal === "lose_weight") base += 1;

    return Math.max(1, Math.min(base, 7));
  })();

  // Start on the recommendation so the picker and the stored answer agree.
  useEffect(() => {
    if (targetFrequency == null) setField("targetFrequency", suggested);
  }, [targetFrequency, suggested, setField]);

  return (
    <View style={styles.root}>
      <StepTitle
        title={t("targetFrequency.title")}
        highlight={t("targetFrequency.highlight")}
        subtitle={t("targetFrequency.subtitle")}
      />
      <RecommendationCard hint={t("targetFrequency.hint")} value={`${suggested} ${t("targetFrequency.unit")}`} />
      <View style={styles.center}>
        <NumberPicker min={1} max={7} value={targetFrequency ?? suggested} onChange={(v) => setField("targetFrequency", v)} unit={t("targetFrequency.unit")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // The picker runs edge to edge, so cancel the 24px side padding of the step.
  center: { flex: 1, justifyContent: "center", marginHorizontal: -24 },
});
