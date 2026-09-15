import { StyleSheet, Text, View } from "react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { theme } from "@/lib/theme";
import { FormInput } from "@/components/onboarding/FormInput";

export default function StepGoalWeight() {
  const { weight, goalWeight, setField } = useOnboardingStore();

  const calculateDiff = () => {
    if (!weight.value || !goalWeight) return null;
    return ((goalWeight - weight.value) / weight.value) * 100;
  };

  const diffPerc = calculateDiff();
  
  let diffMsg = "";
  let diffColor = theme.muted;

  if (diffPerc !== null) {
    if (diffPerc < -15) {
      diffMsg = `You are aiming to lose ${Math.abs(diffPerc).toFixed(1)}% of your body weight. This is a significant goal that requires a steady, long-term approach.`;
      diffColor = theme.ember;
    } else if (diffPerc < 0) {
      diffMsg = `You are aiming to lose ${Math.abs(diffPerc).toFixed(1)}% of your body weight. This is a healthy and achievable target!`;
      diffColor = theme.neon;
    } else if (diffPerc > 15) {
      diffMsg = `You are aiming to gain ${diffPerc.toFixed(1)}% of your body weight. A structured bulking phase will help you achieve this safely.`;
      diffColor = theme.ember;
    } else if (diffPerc > 0) {
      diffMsg = `You are aiming to gain ${diffPerc.toFixed(1)}% of your body weight. Great for building lean mass!`;
      diffColor = theme.neon;
    } else {
      diffMsg = "You are aiming to maintain your current weight. We'll focus on body recomposition.";
      diffColor = theme.neon;
    }
  }

  return (
    <View>
      <Text style={styles.title1}>WHAT IS YOUR</Text>
      <Text style={styles.title2}>GOAL WEIGHT?</Text>
      
      <Text style={styles.subtitle}>
        Setting a realistic target helps us adjust your macronutrient and workout recommendations.
      </Text>

      <FormInput
        label="ENTER VALUE"
        placeholder={weight.unit === "kg" ? "e.g. 70" : "e.g. 155"}
        unit={weight.unit.toUpperCase()}
        keyboardType="numeric"
        value={goalWeight ? goalWeight.toString() : ""}
        onChangeText={(text) => {
          const num = parseFloat(text.replace(/[^0-9.]/g, ""));
          setField("goalWeight", isNaN(num) ? null : num);
        }}
      />

      {diffPerc !== null && (
        <View style={[styles.diffCard, { borderColor: diffColor }]}>
          <Text style={[styles.diffLabel, { color: diffColor }]}>
            {diffPerc > 0 ? "TARGET GAIN" : diffPerc < 0 ? "TARGET LOSS" : "MAINTENANCE"}
          </Text>
          <Text style={styles.diffMsg}>{diffMsg}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title1: {
    color: theme.text,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 36,
  },
  title2: {
    color: theme.neon,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 36,
    marginBottom: 16,
  },
  subtitle: {
    color: theme.muted,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 32,
  },
  diffCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    borderWidth: 1,
  },
  diffLabel: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
  },
  diffMsg: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
