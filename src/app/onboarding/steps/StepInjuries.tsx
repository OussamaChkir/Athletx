import { StyleSheet, Text, View } from "react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { theme } from "@/lib/theme";
import { CheckboxCard } from "@/components/onboarding/CheckboxCard";

const INJURY_OPTIONS = [
  { id: "shoulders", title: "Shoulders" },
  { id: "back", title: "Lower/Upper Back" },
  { id: "knees", title: "Knees" },
  { id: "wrists", title: "Wrists" },
  { id: "elbows", title: "Elbows" },
  { id: "hips", title: "Hips" },
];

export default function StepInjuries() {
  const { injuries, setField } = useOnboardingStore();

  const toggleInjury = (id: string) => {
    if (injuries.includes(id)) {
      setField("injuries", injuries.filter((i) => i !== id));
    } else {
      if (injuries.length < 3) {
        setField("injuries", [...injuries, id]);
      }
    }
  };

  return (
    <View>
      <Text style={styles.title1}>ANY ACTIVE</Text>
      <Text style={styles.title2}>INJURIES?</Text>
      
      <Text style={styles.subtitle}>
        Select up to 3 areas. We will adapt your exercises to avoid straining these joints.
      </Text>

      <View style={styles.options}>
        {INJURY_OPTIONS.map((opt) => {
          const isSelected = injuries.includes(opt.id);
          const isDisabled = !isSelected && injuries.length >= 3;
          
          return (
            <CheckboxCard
              key={opt.id}
              title={opt.title}
              selected={isSelected}
              onToggle={() => toggleInjury(opt.id)}
              disabled={isDisabled}
            />
          );
        })}
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
