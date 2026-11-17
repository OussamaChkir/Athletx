import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Dumbbell, Flame, HeartPulse, Zap } from "lucide-react-native";
import { useOnboardingStore, type Goal } from "@/store/onboarding-store";
import { SelectList, SelectRow } from "@/components/onboarding/SelectRow";
import { StepTitle } from "@/components/onboarding/StepTitle";

// The stored value doubles as the translation key (onboarding: goal.<value>.title / .description).
const OPTIONS: { value: Exclude<Goal, null>; icon: typeof Flame }[] = [
  { value: "lose_weight", icon: Flame },
  { value: "build_muscle", icon: Dumbbell },
  { value: "get_stronger", icon: Zap },
  { value: "maintain", icon: HeartPulse },
];

export default function StepGoal() {
  const { t } = useTranslation("onboarding");
  const { goal, setField } = useOnboardingStore();

  return (
    <View>
      <StepTitle
        title={t("goal.title")}
        highlight={t("goal.highlight")}
        subtitle={t("goal.subtitle")}
      />
      <SelectList>
        {OPTIONS.map((o) => (
          <SelectRow
            key={o.value}
            title={t(`goal.${o.value}.title`)}
            description={t(`goal.${o.value}.description`)}
            icon={o.icon}
            selected={goal === o.value}
            onPress={() => setField("goal", o.value)}
          />
        ))}
      </SelectList>
    </View>
  );
}
