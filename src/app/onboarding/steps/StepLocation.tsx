import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Building, Building2, House, PersonStanding } from "lucide-react-native";
import { useOnboardingStore, type LocationType } from "@/store/onboarding-store";
import { SelectList, SelectRow } from "@/components/onboarding/SelectRow";
import { StepTitle } from "@/components/onboarding/StepTitle";

// The stored value doubles as the translation key (onboarding: location.<value>.title / .description).
const OPTIONS: { value: LocationType; icon: typeof House }[] = [
  { value: "large_gym", icon: Building2 },
  { value: "small_gym", icon: Building },
  { value: "home", icon: House },
  { value: "bodyweight", icon: PersonStanding },
];

export default function StepLocation() {
  const { t } = useTranslation("onboarding");
  const { location, setField } = useOnboardingStore();

  const toggle = (value: LocationType) =>
    setField("location", location.includes(value) ? location.filter((l) => l !== value) : [...location, value]);

  return (
    <View>
      <StepTitle
        title={t("location.title")}
        highlight={t("location.highlight")}
        subtitle={t("location.subtitle")}
      />
      <SelectList>
        {OPTIONS.map((o) => (
          <SelectRow
            key={o.value}
            role="checkbox"
            title={t(`location.${o.value}.title`)}
            description={t(`location.${o.value}.description`)}
            icon={o.icon}
            selected={location.includes(o.value)}
            onPress={() => toggle(o.value)}
          />
        ))}
      </SelectList>
    </View>
  );
}
