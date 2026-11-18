import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { CalendarDays } from "lucide-react-native";
import { useOnboardingStore, type FrequencyStr } from "@/store/onboarding-store";
import { SelectList, SelectRow } from "@/components/onboarding/SelectRow";
import { StepTitle } from "@/components/onboarding/StepTitle";

const OPTIONS: { value: Exclude<FrequencyStr, null>; key: string }[] = [
  { value: "0-1", key: "low" },
  { value: "2-3", key: "mid" },
  { value: "4-5", key: "high" },
  { value: "6+", key: "max" },
];

export default function StepFrequency() {
  const { t } = useTranslation("onboarding");
  const { currentFrequency, setField } = useOnboardingStore();

  return (
    <View>
      <StepTitle
        title={t("frequency.title")}
        highlight={t("frequency.highlight")}
        subtitle={t("frequency.subtitle")}
      />
      <SelectList>
        {OPTIONS.map((o) => (
          <SelectRow
            key={o.value}
            title={t(`frequency.options.${o.key}`)}
            icon={CalendarDays}
            selected={currentFrequency === o.value}
            onPress={() => setField("currentFrequency", o.value)}
          />
        ))}
      </SelectList>
    </View>
  );
}
