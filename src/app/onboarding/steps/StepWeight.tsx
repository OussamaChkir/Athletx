import { StyleSheet, Text, View, Pressable } from "react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { theme } from "@/lib/theme";
import { FormInput } from "@/components/onboarding/FormInput";

export function StepWeight() {
  const { weight, height, setField } = useOnboardingStore();

  const toggleUnit = () => {
    setField("weight", { ...weight, unit: weight.unit === "kg" ? "lb" : "kg" });
  };

  const calculateBMI = () => {
    if (!weight.value || !height.value) return null;

    let wKg = weight.value;
    if (weight.unit === "lb") wKg = weight.value * 0.453592;

    let hM = 0;
    if (height.unit === "cm") {
      hM = height.value / 100;
    } else {
      // Assuming 5.11 format -> 5 ft 11 in
      const ft = Math.floor(height.value);
      const inches = Math.round((height.value - ft) * 100);
      const totalInches = (ft * 12) + inches;
      hM = totalInches * 0.0254;
    }

    if (hM <= 0) return null;
    return wKg / (hM * hM);
  };

  const bmi = calculateBMI();

  let bmiMsg = "";
  let bmiColor = theme.muted;

  if (bmi) {
    if (bmi < 18.5) {
      bmiMsg = "Underweight - Focus on a caloric surplus and strength training.";
      bmiColor = theme.ember;
    } else if (bmi < 25) {
      bmiMsg = "Healthy weight - Great! Focus on body recomposition or maintaining.";
      bmiColor = theme.neon;
    } else if (bmi < 30) {
      bmiMsg = "Overweight - A slight caloric deficit is recommended.";
      bmiColor = theme.ember;
    } else {
      bmiMsg = "Obese - Focus on a sustainable caloric deficit and daily activity.";
      bmiColor = theme.danger;
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
});
