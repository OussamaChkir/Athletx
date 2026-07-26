import { StyleSheet, Text, View, Pressable } from "react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { theme } from "@/lib/theme";
import { FormInput } from "@/components/onboarding/FormInput";

export function StepHeight() {
  const { height, setField } = useOnboardingStore();

  const toggleUnit = () => {
    setField("height", { ...height, unit: height.unit === "cm" ? "ft" : "cm" });
  };

  return (
    <View>
      <Text style={styles.title1}>WHAT IS YOUR</Text>
      <Text style={styles.title2}>HEIGHT?</Text>
      
      <View style={styles.unitToggle}>
        <Text style={styles.unitToggleLabel}>UNIT</Text>
        <Pressable style={styles.toggleBtn} onPress={toggleUnit}>
          <View style={[styles.toggleOption, height.unit === "cm" && styles.toggleActive]}>
            <Text style={[styles.toggleText, height.unit === "cm" && styles.toggleTextActive]}>CM</Text>
          </View>
          <View style={[styles.toggleOption, height.unit === "ft" && styles.toggleActive]}>
            <Text style={[styles.toggleText, height.unit === "ft" && styles.toggleTextActive]}>FT/IN</Text>
          </View>
        </Pressable>
      </View>

      <FormInput
        label="ENTER VALUE"
        placeholder={height.unit === "cm" ? "e.g. 180" : "e.g. 5.11"}
        unit={height.unit.toUpperCase()}
        keyboardType="numeric"
        value={height.value ? height.value.toString() : ""}
        onChangeText={(text) => {
          const num = parseFloat(text.replace(/[^0-9.]/g, ""));
          setField("height", { ...height, value: isNaN(num) ? null : num });
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
  unitToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    backgroundColor: theme.surface,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  unitToggleLabel: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginLeft: 4,
  },
  toggleBtn: {
    flexDirection: "row",
    backgroundColor: theme.background,
    borderRadius: 8,
    padding: 4,
  },
  toggleOption: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  toggleActive: {
    backgroundColor: theme.neon,
  },
  toggleText: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  toggleTextActive: {
    color: theme.background,
  },
});
