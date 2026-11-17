import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Dumbbell, Flame, Sparkles } from "lucide-react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { SelectList, SelectRow } from "@/components/onboarding/SelectRow";
import { StepTitle } from "@/components/onboarding/StepTitle";

export default function StepExperience() {
  const { t } = useTranslation("onboarding");
  const { experience, setField } = useOnboardingStore();

  return (
    <View>
      <StepTitle
        title={t("experience.title")}
        highlight={t("experience.highlight")}
        subtitle={t("experience.subtitle")}
      />
      <SelectList>
        <SelectRow
          title={t("experience.beginner.title")}
          description={t("experience.beginner.description")}
          icon={Sparkles}
          selected={experience === "beginner"}
          onPress={() => setField("experience", "beginner")}
        />
        <SelectRow
          title={t("experience.intermediate.title")}
          description={t("experience.intermediate.description")}
          icon={Dumbbell}
          selected={experience === "intermediate"}
          onPress={() => setField("experience", "intermediate")}
        />
        <SelectRow
          title={t("experience.advanced.title")}
          description={t("experience.advanced.description")}
          icon={Flame}
          selected={experience === "advanced"}
          onPress={() => setField("experience", "advanced")}
        />
      </SelectList>
    </View>
  );
}
