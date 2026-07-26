import { StyleSheet, Text, View } from "react-native";
import { Target, Activity, Zap, ShieldCheck } from "lucide-react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { theme } from "@/lib/theme";
import { RadioCard } from "@/components/onboarding/RadioCard";

export function StepGoal() {
  const { goal, setField } = useOnboardingStore();

  return (
    <View>
      <Text style={styles.title1}>WHAT IS YOUR</Text>
      <Text style={styles.title2}>FITNESS GOAL?</Text>
      
      <Text style={styles.subtitle}>
        This dictates the types of workouts, volume, and intensity we will generate for you.
      </Text>

      <View style={styles.options}>
        <RadioCard
          title="Lose Weight"
          description="Focus on burning calories and leaning out."
          icon={Activity}
          selected={goal === "lose_weight"}
          onSelect={() => setField("goal", "lose_weight")}
        />
        <RadioCard
          title="Build Muscle"
          description="Hypertrophy focused training for mass."
          icon={Zap}
          selected={goal === "build_muscle"}
          onSelect={() => setField("goal", "build_muscle")}
        />
        <RadioCard
          title="Get Stronger"
          description="Lower rep ranges for max strength gains."
          icon={Target}
          selected={goal === "get_stronger"}
          onSelect={() => setField("goal", "get_stronger")}
        />
        <RadioCard
          title="Maintain Fitness"
          description="Balanced routine for overall health."
          icon={ShieldCheck}
          selected={goal === "maintain"}
          onSelect={() => setField("goal", "maintain")}
        />
      </View>
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
  options: {
    gap: 12,
  },
});
