import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { useOnboardingStore } from "@/store/onboarding-store";
import { SelectList, SelectRow } from "@/components/onboarding/SelectRow";
import { StepTitle } from "@/components/onboarding/StepTitle";

// Ids are stored; the text lives in the onboarding namespace (focus.<id>). Only some options have a description.
const FOCUS_OPTIONS = [
  { id: "upper", hasDescription: true },
  { id: "lower", hasDescription: true },
  { id: "core", hasDescription: false },
  { id: "full", hasDescription: false },
];

export default function StepFocus() {
  const { t } = useTranslation("onboarding");
  const { focusArea, setField } = useOnboardingStore();

  const toggle = (id: string) =>
    setField("focusArea", focusArea.includes(id) ? focusArea.filter((f) => f !== id) : [...focusArea, id]);

  return (
    <View>
      <StepTitle
        title={t("focus.title")}
        highlight={t("focus.highlight")}
        subtitle={t("focus.subtitle")}
      />
      <SelectList>
        {FOCUS_OPTIONS.map((o) => (
          <SelectRow
            key={o.id}
            role="checkbox"
            title={t(`focus.${o.id}.title`)}
            description={o.hasDescription ? t(`focus.${o.id}.description`) : undefined}
            selected={focusArea.includes(o.id)}
            onPress={() => toggle(o.id)}
          />
        ))}
      </SelectList>
    </View>
  );
}
