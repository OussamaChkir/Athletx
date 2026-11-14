import { View } from "react-native";
import { CalendarDays } from "lucide-react-native";
import { useOnboardingStore, type FrequencyStr } from "@/store/onboarding-store";
import { SelectList, SelectRow } from "@/components/onboarding/SelectRow";
import { StepTitle } from "@/components/onboarding/StepTitle";

const OPTIONS: { value: Exclude<FrequencyStr, null>; title: string }[] = [
  { value: "0-1", title: "0-1 days a week" },
  { value: "2-3", title: "2-3 days a week" },
  { value: "4-5", title: "4-5 days a week" },
  { value: "6+", title: "6+ days a week" },
];

export default function StepFrequency() {
  const { currentFrequency, setField } = useOnboardingStore();

  return (
    <View>
      <StepTitle
        title="How often do you"
        highlight="work out?"
        subtitle="Tell us your current routine so we can suggest a schedule you can keep."
      />
      <SelectList>
        {OPTIONS.map((o) => (
          <SelectRow
            key={o.value}
            title={o.title}
            icon={CalendarDays}
            selected={currentFrequency === o.value}
            onPress={() => setField("currentFrequency", o.value)}
          />
        ))}
      </SelectList>
    </View>
  );
}
