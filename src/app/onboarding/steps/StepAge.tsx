import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useOnboardingStore } from "@/store/onboarding-store";
import { NumberPicker } from "@/components/onboarding/NumberPicker";
import { StepTitle } from "@/components/onboarding/StepTitle";

const DEFAULT_AGE = 25;

export default function StepAge() {
  const { t } = useTranslation("onboarding");
  const { age, setField } = useOnboardingStore();

  // The picker always shows a number, so make sure one is stored and Continue works right away.
  useEffect(() => {
    if (age == null) setField("age", DEFAULT_AGE);
  }, [age, setField]);

  return (
    <View style={styles.root}>
      <StepTitle
        title={t("age.title")}
        highlight={t("age.highlight")}
        subtitle={t("age.subtitle")}
      />
      <View style={styles.center}>
        <NumberPicker min={10} max={99} value={age ?? DEFAULT_AGE} onChange={(v) => setField("age", v)} unit={t("age.unit")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // The picker runs edge to edge, so cancel the 24px side padding of the step.
  center: { flex: 1, justifyContent: "center", marginHorizontal: -24 },
});
