import { StyleSheet, Text, View } from "react-native";
import { Timer, Zap, Clock, Hourglass } from "lucide-react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { theme } from "@/lib/theme";
import { RadioCard } from "@/components/onboarding/RadioCard";

export function StepDuration() {
  const { duration, setField } = useOnboardingStore();

  return (
    <View>
      <Text style={styles.title1}>WORKOUT</Text>
      <Text style={styles.title2}>DURATION?</Text>
      
      <Text style={styles.subtitle}>
        How much time can you realistically dedicate to a single workout session?
      </Text>

      <View style={styles.options}>
        <RadioCard
          title="Quick (up to 20 min)"
          description="~3 exercises. High intensity, minimal rest."
          icon={Zap}
          selected={duration === "quick"}
          onSelect={() => setField("duration", "quick")}
        />
        <RadioCard
          title="20 - 40 minutes"
          description="4-6 exercises. Balanced routine."
          icon={Timer}
          selected={duration === "20-40"}
          onSelect={() => setField("duration", "20-40")}
        />
        <RadioCard
          title="40 - 60 minutes"
          description="5-7 exercises. Thorough workout with optimal rest."
          icon={Clock}
          selected={duration === "40-60"}
          onSelect={() => setField("duration", "40-60")}
        />
        <RadioCard
          title="60+ minutes"
          description="8-10 exercises. Comprehensive training session."
          icon={Hourglass}
          selected={duration === "60+"}
          onSelect={() => setField("duration", "60+")}
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
