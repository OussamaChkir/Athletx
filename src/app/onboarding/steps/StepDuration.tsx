import { View } from "react-native";
import { Clock, Hourglass, Timer, Zap } from "lucide-react-native";
import { useOnboardingStore, type DurationType } from "@/store/onboarding-store";
import { SelectList, SelectRow } from "@/components/onboarding/SelectRow";
import { StepTitle } from "@/components/onboarding/StepTitle";

const OPTIONS: { value: Exclude<DurationType, null>; title: string; description: string; icon: typeof Zap }[] = [
  { value: "quick", title: "Quick (up to 20 min)", description: "About 3 exercises. High intensity, minimal rest.", icon: Zap },
  { value: "20-40", title: "20 - 40 minutes", description: "4-6 exercises. A balanced routine.", icon: Timer },
  { value: "40-60", title: "40 - 60 minutes", description: "5-7 exercises with proper rest.", icon: Clock },
  { value: "60+", title: "60+ minutes", description: "8-10 exercises. A full training session.", icon: Hourglass },
];

export default function StepDuration() {
  const { duration, setField } = useOnboardingStore();

  return (
    <View>
      <StepTitle
        title="How long per"
        highlight="workout?"
        subtitle="How much time can you realistically give a single session?"
      />
      <SelectList>
        {OPTIONS.map((o) => (
          <SelectRow
            key={o.value}
            title={o.title}
            description={o.description}
            icon={o.icon}
            selected={duration === o.value}
            onPress={() => setField("duration", o.value)}
          />
        ))}
      </SelectList>
    </View>
  );
}
