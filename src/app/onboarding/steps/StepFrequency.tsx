import { StyleSheet, Text, View } from "react-native";
import { Calendar } from "lucide-react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { theme } from "@/lib/theme";
import { RadioCard } from "@/components/onboarding/RadioCard";

export default function StepFrequency() {
  const { currentFrequency, setField } = useOnboardingStore();

  return (
    <View>
      <Text style={styles.title1}>HOW OFTEN DO</Text>
      <Text style={styles.title2}>YOU WORK OUT?</Text>
      
      <Text style={styles.subtitle}>
        Tell us your current routine so we can suggest a sustainable schedule for your goals.
      </Text>

      <View style={styles.options}>
        <RadioCard
          title="0-1 days a week"
          icon={Calendar}
          selected={currentFrequency === "0-1"}
          onSelect={() => setField("currentFrequency", "0-1")}
        />
        <RadioCard
          title="2-3 days a week"
          icon={Calendar}
          selected={currentFrequency === "2-3"}
          onSelect={() => setField("currentFrequency", "2-3")}
        />
        <RadioCard
          title="4-5 days a week"
          icon={Calendar}
          selected={currentFrequency === "4-5"}
          onSelect={() => setField("currentFrequency", "4-5")}
        />
        <RadioCard
          title="6+ days a week"
          icon={Calendar}
          selected={currentFrequency === "6+"}
          onSelect={() => setField("currentFrequency", "6+")}
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
