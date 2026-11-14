import { View } from "react-native";
import { Dumbbell, Flame, Sparkles } from "lucide-react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { SelectList, SelectRow } from "@/components/onboarding/SelectRow";
import { StepTitle } from "@/components/onboarding/StepTitle";

export default function StepExperience() {
  const { experience, setField } = useOnboardingStore();

  return (
    <View>
      <StepTitle
        title="What's your"
        highlight="level?"
        subtitle="This helps us match your workouts to what you can do today."
      />
      <SelectList>
        <SelectRow
          title="Beginner"
          description="New to working out, or back after a long break."
          icon={Sparkles}
          selected={experience === "beginner"}
          onPress={() => setField("experience", "beginner")}
        />
        <SelectRow
          title="Intermediate"
          description="Active 2-3 times a week for at least 6 months."
          icon={Dumbbell}
          selected={experience === "intermediate"}
          onPress={() => setField("experience", "intermediate")}
        />
        <SelectRow
          title="Advanced"
          description="Consistent training 4+ days a week with high intensity."
          icon={Flame}
          selected={experience === "advanced"}
          onPress={() => setField("experience", "advanced")}
        />
      </SelectList>
    </View>
  );
}
