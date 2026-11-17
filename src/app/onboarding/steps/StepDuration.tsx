import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Clock, Hourglass, Timer, Zap } from "lucide-react-native";
import { useOnboardingStore, type DurationType } from "@/store/onboarding-store";
import { SelectList, SelectRow } from "@/components/onboarding/SelectRow";
import { StepTitle } from "@/components/onboarding/StepTitle";

// `key` points at the translated text in the onboarding namespace; `value` is the stored id.
const OPTIONS: { value: Exclude<DurationType, null>; key: string; icon: typeof Zap }[] = [
  { value: "quick", key: "quick", icon: Zap },
  { value: "20-40", key: "short", icon: Timer },
  { value: "40-60", key: "medium", icon: Clock },
  { value: "60+", key: "long", icon: Hourglass },
];

export default function StepDuration() {
  const { t } = useTranslation("onboarding");
  const { duration, setField } = useOnboardingStore();

  return (
    <View>
      <StepTitle
        title={t("duration.title")}
        highlight={t("duration.highlight")}
        subtitle={t("duration.subtitle")}
      />
      <SelectList>
        {OPTIONS.map((o) => (
          <SelectRow
            key={o.value}
            title={t(`duration.${o.key}.title`)}
            description={t(`duration.${o.key}.description`)}
            icon={o.icon}
            selected={duration === o.value}
            onPress={() => setField("duration", o.value)}
          />
        ))}
      </SelectList>
    </View>
  );
}
