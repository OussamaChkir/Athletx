import { StyleSheet, View } from "react-native";
import { Mars, Venus } from "lucide-react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { GenderCard } from "@/components/onboarding/GenderCard";
import { StepTitle } from "@/components/onboarding/StepTitle";
import { spacing } from "@/lib/theme";

// Symbol colors come from the design reference and are not part of the app palette.
const MALE_TINT = "#7d98ff";
const FEMALE_TINT = "#ff7fba";

export default function StepGender() {
  const { gender, setField } = useOnboardingStore();

  return (
    <View>
      <StepTitle
        title="Tell us your"
        highlight="gender"
        subtitle="We use this to estimate your metabolic rate and personalize your calorie targets."
      />
      <View style={styles.row}>
        <GenderCard
          label="Male"
          description="Estimates tuned for a male profile"
          icon={Mars}
          tint={MALE_TINT}
          selected={gender === "male"}
          onPress={() => setField("gender", "male")}
        />
        <GenderCard
          label="Female"
          description="Estimates tuned for a female profile"
          icon={Venus}
          tint={FEMALE_TINT}
          selected={gender === "female"}
          onPress={() => setField("gender", "female")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.md },
});
