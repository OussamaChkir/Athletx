import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { useOnboardingStore } from "@/store/onboarding-store";
import { SelectList, SelectRow } from "@/components/onboarding/SelectRow";
import { StepTitle } from "@/components/onboarding/StepTitle";

const MAX_INJURIES = 3;

// Ids are stored; the text lives in the onboarding namespace (injuries.<id>).
const INJURY_IDS = ["shoulders", "back", "knees", "wrists", "elbows", "hips"];

export default function StepInjuries() {
  const { t } = useTranslation("onboarding");
  const { injuries, setField } = useOnboardingStore();

  const toggle = (id: string) => {
    if (injuries.includes(id)) setField("injuries", injuries.filter((i) => i !== id));
    else if (injuries.length < MAX_INJURIES) setField("injuries", [...injuries, id]);
  };

  return (
    <View>
      <StepTitle
        title={t("injuries.title")}
        highlight={t("injuries.highlight")}
        subtitle={t("injuries.subtitle", { max: MAX_INJURIES })}
      />
      <SelectList>
        {INJURY_IDS.map((id) => {
          const selected = injuries.includes(id);
          return (
            <SelectRow
              key={id}
              role="checkbox"
              title={t(`injuries.${id}`)}
              selected={selected}
              disabled={!selected && injuries.length >= MAX_INJURIES}
              onPress={() => toggle(id)}
            />
          );
        })}
      </SelectList>
    </View>
  );
}
