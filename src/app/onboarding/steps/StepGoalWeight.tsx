import { StyleSheet, View } from "react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { HealthSourcesLink } from "@/components/health-sources";
import { InfoCard } from "@/components/onboarding/InfoCard";
import { StepTitle } from "@/components/onboarding/StepTitle";
import { ValueRuler } from "@/components/onboarding/ValueRuler";
import { WEIGHT_RULERS } from "@/components/onboarding/ruler-configs";
import { colors, theme } from "@/lib/theme";

export default function StepGoalWeight() {
  const { weight, goalWeight, setField } = useOnboardingStore();

  const diffPerc = weight.value && goalWeight ? ((goalWeight - weight.value) / weight.value) * 100 : null;

  let diffLabel = "";
  let diffMsg = "";
  let diffColor: string = colors.accent;
  if (diffPerc !== null) {
    if (diffPerc < -15) {
      diffMsg = `You are aiming to lose ${Math.abs(diffPerc).toFixed(1)}% of your body weight. This is a significant goal that takes a steady, long-term approach. Check with a healthcare professional if unsure.`;
      diffColor = theme.ember;
    } else if (diffPerc < 0) {
      diffMsg = `You are aiming to lose ${Math.abs(diffPerc).toFixed(1)}% of your body weight. This is a moderate goal that can be approached gradually.`;
    } else if (diffPerc > 15) {
      diffMsg = `You are aiming to gain ${diffPerc.toFixed(1)}% of your body weight. This is a large change, so a gradual, structured approach is usually recommended. Check with a healthcare professional if unsure.`;
      diffColor = theme.ember;
    } else if (diffPerc > 0) {
      diffMsg = `You are aiming to gain ${diffPerc.toFixed(1)}% of your body weight. A gradual gain can support building lean mass.`;
    } else {
      diffMsg = "You are aiming to maintain your current weight. We'll focus on body recomposition.";
    }
    diffLabel = diffPerc > 0 ? "TARGET GAIN" : diffPerc < 0 ? "TARGET LOSS" : "MAINTENANCE";
  }

  return (
    <View style={styles.root}>
      <StepTitle
        title="What's your"
        highlight="goal weight?"
        subtitle="A realistic target helps us tune your workouts and nutrition."
      />
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
