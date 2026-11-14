import { View } from "react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { SelectList, SelectRow } from "@/components/onboarding/SelectRow";
import { StepTitle } from "@/components/onboarding/StepTitle";

const FOCUS_OPTIONS = [
  { id: "upper", title: "Upper Body", description: "Chest, back and arms" },
  { id: "lower", title: "Lower Body", description: "Legs and glutes" },
  { id: "core", title: "Core & Abs" },
  { id: "full", title: "Full Body Balance" },
];

export default function StepFocus() {
  const { focusArea, setField } = useOnboardingStore();

  const toggle = (id: string) =>
    setField("focusArea", focusArea.includes(id) ? focusArea.filter((f) => f !== id) : [...focusArea, id]);

  return (
    <View>
      <StepTitle
        title="Which area to"
        highlight="focus on?"
        subtitle="Select the muscle groups you want to prioritize."
      />
      <SelectList>
        {FOCUS_OPTIONS.map((o) => (
          <SelectRow
            key={o.id}
            role="checkbox"
            title={o.title}
            description={o.description}
            selected={focusArea.includes(o.id)}
            onPress={() => toggle(o.id)}
          />
        ))}
      </SelectList>
    </View>
  );
}
