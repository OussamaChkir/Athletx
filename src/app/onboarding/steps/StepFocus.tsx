import { StyleSheet, Text, View } from "react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { theme } from "@/lib/theme";
import { CheckboxCard } from "@/components/onboarding/CheckboxCard";

const FOCUS_OPTIONS = [
  { id: "upper", title: "Upper Body (Chest, Back, Arms)" },
  { id: "lower", title: "Lower Body (Legs, Glutes)" },
  { id: "core", title: "Core & Abs" },
  { id: "full", title: "Full Body Balance" },
];

export default function StepFocus() {
  const { focusArea, setField } = useOnboardingStore();

  const toggleFocus = (id: string) => {
    if (focusArea.includes(id)) {
      setField("focusArea", focusArea.filter((f) => f !== id));
    } else {
      setField("focusArea", [...focusArea, id]);
    }
  };

  return (
    <View>
      <Text style={styles.title1}>WHICH AREA TO</Text>
      <Text style={styles.title2}>FOCUS ON?</Text>
      
      <Text style={styles.subtitle}>
        Select the muscle groups you want to prioritize in your training plan.
      </Text>

      <View style={styles.options}>
        {FOCUS_OPTIONS.map((opt) => (
          <CheckboxCard
            key={opt.id}
            title={opt.title}
            selected={focusArea.includes(opt.id)}
            onToggle={() => toggleFocus(opt.id)}
          />
        ))}
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
