import { StyleSheet, Text, View, Pressable } from "react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { theme } from "@/lib/theme";

export default function StepTargetFrequency() {
  const { targetFrequency, experience, goal, setField } = useOnboardingStore();

  const getSuggestedFrequency = () => {
    let base = 3;
    if (experience === "intermediate") base = 4;
    if (experience === "advanced") base = 5;

    if (goal === "build_muscle") base += 1;
    if (goal === "maintain") base -= 1;
    if (goal === "lose_weight") base += 1;

    return Math.max(1, Math.min(base, 7)); // clamp between 1 and 7
  };

  const suggested = getSuggestedFrequency();

  return (
    <View>
      <Text style={styles.title1}>TARGET</Text>
      <Text style={styles.title2}>FREQUENCY?</Text>
      
      <Text style={styles.subtitle}>
        How many days a week do you plan to train? Consistency is key to reaching your goals.
      </Text>

      <View style={styles.suggestedBox}>
        <View style={styles.suggestedIconContainer}>
          <Text style={styles.suggestedIcon}>★</Text>
        </View>
        <Text style={styles.suggestedText}>
          Based on your profile, we recommend <Text style={styles.highlight}>{suggested} days/week</Text>.
        </Text>
      </View>

      <View style={styles.optionsGrid}>
        {[1, 2, 3, 4, 5, 6, 7].map((num) => {
          const isSelected = targetFrequency === num;
          return (
            <Pressable
              key={num}
              style={[styles.numberBtn, isSelected && styles.numberBtnSelected]}
              onPress={() => setField("targetFrequency", num)}
            >
              <Text style={[styles.numberText, isSelected && styles.numberTextSelected]}>
                {num}
              </Text>
            </Pressable>
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
    marginBottom: 24,
  },
  subtitle: {
    color: theme.muted,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 32,
  },
  suggestedBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(8, 253, 142, 0.05)",
    borderWidth: 1,
    borderColor: theme.neon,
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
    gap: 16,
  },
  suggestedIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.neon,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestedIcon: {
    color: theme.background,
    fontSize: 16,
    fontWeight: "900",
  },
  suggestedText: {
    flex: 1,
    color: theme.text,
    fontSize: 14,
    lineHeight: 22,
  },
  highlight: {
    color: theme.neon,
    fontWeight: "800",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  numberBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
  },
  numberBtnSelected: {
    backgroundColor: theme.neon,
    borderColor: theme.neon,
  },
  numberText: {
    color: theme.text,
    fontSize: 24,
    fontWeight: "800",
  },
  numberTextSelected: {
    color: theme.background,
  },
});
