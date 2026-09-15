import { StyleSheet, Text, View } from "react-native";
import { Sparkles, Dumbbell, Flame } from "lucide-react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { theme } from "@/lib/theme";
import { RadioCard } from "@/components/onboarding/RadioCard";

export default function StepExperience() {
  const { experience, setField } = useOnboardingStore();

  return (
    <View>
      <Text style={styles.title1}>WHAT'S YOUR</Text>
      <Text style={styles.title2}>LEVEL?</Text>
      
      <Text style={styles.subtitle}>
        This helps us tailor your daily workouts to match your current physical capabilities.
      </Text>

      <View style={styles.options}>
        <RadioCard
          title="Beginner"
          description="New to working out or back after a long break."
          icon={Sparkles}
          selected={experience === "beginner"}
          onSelect={() => setField("experience", "beginner")}
        />
        <RadioCard
          title="Intermediate"
          description="Active 2-3 times a week for at least 6 months."
          icon={Dumbbell}
          selected={experience === "intermediate"}
          onSelect={() => setField("experience", "intermediate")}
        />
        <RadioCard
          title="Advanced"
          description="Consistent training 4+ days a week with high intensity."
          icon={Flame}
          selected={experience === "advanced"}
          onSelect={() => setField("experience", "advanced")}
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
