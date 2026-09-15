import { StyleSheet, Text, View } from "react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { theme } from "@/lib/theme";
import { FormInput } from "@/components/onboarding/FormInput";

export default function StepAge() {
  const { age, setField } = useOnboardingStore();

  return (
    <View>
      <Text style={styles.title1}>WHAT IS YOUR</Text>
      <Text style={styles.title2}>CURRENT AGE?</Text>
      
      <View style={styles.infoBox}>
        <View style={styles.infoIconContainer}>
          <Text style={styles.infoIcon}>i</Text>
        </View>
        <Text style={styles.infoText}>
          Your age helps us calculate your metabolic rate and design a workout intensity that's safe for your joints and recovery capacity.
        </Text>
      </View>

      <FormInput
        label="ENTER VALUE"
        placeholder="Your answer..."
        unit="YEARS OLD"
        keyboardType="number-pad"
        value={age ? age.toString() : ""}
        onChangeText={(text) => {
          const num = parseInt(text.replace(/[^0-9]/g, ""), 10);
          setField("age", isNaN(num) ? null : num);
        }}
      />
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
  infoBox: {
    flexDirection: "row",
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 32,
    gap: 16,
  },
  infoIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(8, 253, 142, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoIcon: {
    color: theme.neon,
    fontSize: 14,
    fontWeight: "900",
  },
  infoText: {
    flex: 1,
    color: theme.muted,
    fontSize: 13,
    lineHeight: 20,
  },
});
