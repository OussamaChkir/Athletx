import { View } from "react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { SelectList, SelectRow } from "@/components/onboarding/SelectRow";
import { StepTitle } from "@/components/onboarding/StepTitle";

const MAX_INJURIES = 3;

const INJURY_OPTIONS = [
  { id: "shoulders", title: "Shoulders" },
  { id: "back", title: "Lower/Upper Back" },
  { id: "knees", title: "Knees" },
  { id: "wrists", title: "Wrists" },
  { id: "elbows", title: "Elbows" },
  { id: "hips", title: "Hips" },
];

export default function StepInjuries() {
  const { injuries, setField } = useOnboardingStore();

  const toggle = (id: string) => {
    if (injuries.includes(id)) setField("injuries", injuries.filter((i) => i !== id));
    else if (injuries.length < MAX_INJURIES) setField("injuries", [...injuries, id]);
  };

  return (
    <View>
      <StepTitle
        title="Any active"
        highlight="injuries?"
        subtitle={`Select up to ${MAX_INJURIES} areas. We'll adapt your exercises to avoid straining them.`}
      />
      <SelectList>
        {INJURY_OPTIONS.map((o) => {
          const selected = injuries.includes(o.id);
          return (
            <SelectRow
              key={o.id}
              role="checkbox"
              title={o.title}
              selected={selected}
              disabled={!selected && injuries.length >= MAX_INJURIES}
              onPress={() => toggle(o.id)}
            />
          );
        })}
      </SelectList>
    </View>
  );
}
