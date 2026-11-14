import { View } from "react-native";
import { Dumbbell, Flame, HeartPulse, Zap } from "lucide-react-native";
import { useOnboardingStore, type Goal } from "@/store/onboarding-store";
import { SelectList, SelectRow } from "@/components/onboarding/SelectRow";
import { StepTitle } from "@/components/onboarding/StepTitle";

const OPTIONS: { value: Exclude<Goal, null>; title: string; description: string; icon: typeof Flame }[] = [
  { value: "lose_weight", title: "Lose Weight", description: "Burn calories and lean out.", icon: Flame },
  { value: "build_muscle", title: "Build Muscle", description: "Hypertrophy-focused training for size.", icon: Dumbbell },
  { value: "get_stronger", title: "Get Stronger", description: "Lower rep ranges for maximum strength.", icon: Zap },
  { value: "maintain", title: "Maintain Fitness", description: "A balanced routine for overall health.", icon: HeartPulse },
];

export default function StepGoal() {
  const { goal, setField } = useOnboardingStore();

  return (
    <View>
      <StepTitle
        title="What's your"
        highlight="fitness goal?"
        subtitle="This sets the workouts, volume and intensity we build for you."
      />
      <SelectList>
        {OPTIONS.map((o) => (
          <SelectRow
            key={o.value}
            title={o.title}
            description={o.description}
            icon={o.icon}
            selected={goal === o.value}
            onPress={() => setField("goal", o.value)}
          />
        ))}
      </SelectList>
    </View>
  );
}
