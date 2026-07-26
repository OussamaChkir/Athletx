import { StyleSheet, Text, View } from "react-native";
import { User, Users } from "lucide-react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { theme } from "@/lib/theme";
import { RadioCard } from "@/components/onboarding/RadioCard";

export function StepGender() {
  const { gender, setField } = useOnboardingStore();

  return (
    <View>
      <Text style={styles.title1}>WHAT IS YOUR</Text>
      <Text style={styles.title2}>GENDER?</Text>
      
      <Text style={styles.subtitle}>
        This helps us accurately calculate your metabolic rate and personalize your caloric recommendations.
      </Text>

      <View style={styles.options}>
        <RadioCard
          title="Male"
          icon={User}
          selected={gender === "male"}
          onSelect={() => setField("gender", "male")}
        />
        <RadioCard
          title="Female"
          icon={User}
          selected={gender === "female"}
          onSelect={() => setField("gender", "female")}
        />
        <RadioCard
          title="Other"
          icon={Users}
          selected={gender === "other"}
          onSelect={() => setField("gender", "other")}
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
