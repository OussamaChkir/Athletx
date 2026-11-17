import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Mars, Venus } from "lucide-react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { GenderCard } from "@/components/onboarding/GenderCard";
import { StepTitle } from "@/components/onboarding/StepTitle";
import { spacing } from "@/lib/theme";

// Symbol colors come from the design reference and are not part of the app palette.
const MALE_TINT = "#7d98ff";
const FEMALE_TINT = "#ff7fba";

export default function StepGender() {
  const { t } = useTranslation("onboarding");
  const { gender, setField } = useOnboardingStore();

  return (
    <View>
      <StepTitle
        title={t("gender.title")}
        highlight={t("gender.highlight")}
        subtitle={t("gender.subtitle")}
      />
      <View style={styles.row}>
        <GenderCard
          label={t("gender.male.title")}
          description={t("gender.male.description")}
          icon={Mars}
          tint={MALE_TINT}
          selected={gender === "male"}
          onPress={() => setField("gender", "male")}
        />
        <GenderCard
          label={t("gender.female.title")}
          description={t("gender.female.description")}
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
