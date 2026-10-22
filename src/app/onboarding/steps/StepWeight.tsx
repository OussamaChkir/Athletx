import { StyleSheet, Text, View, Pressable } from "react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { theme } from "@/lib/theme";
import { FormInput } from "@/components/onboarding/FormInput";
import { heightToCm } from "@/lib/weight";
import { HealthSourcesLink } from "@/components/health-sources";
import {
  BMI_CATEGORY_TEXT,
  MINOR_BMI_TEXT,
  adultBmiCategory,
  isUnderAdultAge,
  type BmiCategory,
} from "@/lib/health-sources";

export default function StepWeight() {
  const { weight, height, age, setField, setWeightUnit } = useOnboardingStore();

  const toggleUnit = () => {
    setWeightUnit(weight.unit === "kg" ? "lb" : "kg");
  };

  const calculateBMI = () => {
    if (!weight.value || !height.value) return null;

    const wKg = weight.unit === "lb" ? weight.value * 0.453592 : weight.value;
    const hM = heightToCm(height.value, height.unit) / 100;

    if (hM <= 0) return null;
    return wKg / (hM * hM);
  };

  const bmi = calculateBMI();

  const BMI_COLORS: Record<BmiCategory, string> = {
    underweight: theme.ember,
    healthy: theme.neon,
    overweight: theme.ember,
    obese: theme.danger,
  };

  // Adult cut-offs (WHO / CDC) don't apply under 18, so no category is shown for minors.
  const isMinor = isUnderAdultAge(age);
  let bmiMsg = "";
  let bmiColor: string = theme.muted;

  if (bmi) {
    if (isMinor) {
      bmiMsg = MINOR_BMI_TEXT;
    } else {
      const category = adultBmiCategory(bmi);
      bmiMsg = BMI_CATEGORY_TEXT[category];
      bmiColor = BMI_COLORS[category];
    }
  }

  return (
    <View>
      <Text style={styles.title1}>WHAT IS YOUR</Text>
      <Text style={styles.title2}>CURRENT WEIGHT?</Text>
      
      <View style={styles.unitToggle}>
        <Text style={styles.unitToggleLabel}>UNIT</Text>
        <Pressable style={styles.toggleBtn} onPress={toggleUnit}>
          <View style={[styles.toggleOption, weight.unit === "kg" && styles.toggleActive]}>
            <Text style={[styles.toggleText, weight.unit === "kg" && styles.toggleTextActive]}>KG</Text>
          </View>
          <View style={[styles.toggleOption, weight.unit === "lb" && styles.toggleActive]}>
            <Text style={[styles.toggleText, weight.unit === "lb" && styles.toggleTextActive]}>LB</Text>
          </View>
        </Pressable>
      </View>

      <FormInput
        label="ENTER VALUE"
        placeholder={weight.unit === "kg" ? "e.g. 75" : "e.g. 165"}
        unit={weight.unit.toUpperCase()}
        keyboardType="numeric"
        value={weight.value ? weight.value.toString() : ""}
        onChangeText={(text) => {
          const num = parseFloat(text.replace(/[^0-9.]/g, ""));
          setField("weight", { ...weight, value: isNaN(num) ? null : num });
        }}
      />

      {bmi !== null && (
        <View style={[styles.bmiCard, { borderColor: bmiColor }]}>
          <Text style={[styles.bmiLabel, { color: bmiColor }]}>ESTIMATED BMI: {bmi.toFixed(1)}</Text>
          <Text style={styles.bmiMsg}>{bmiMsg}</Text>
          <Text style={styles.bmiNote}>
            Estimate only, not medical advice. Ranges based on WHO and CDC BMI classifications.
          </Text>
          <HealthSourcesLink />
        </View>
      )}
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
  bmiCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    borderWidth: 1,
  },
  bmiLabel: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
  },
  bmiMsg: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 20,
  },
  bmiNote: {
    color: theme.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
});
