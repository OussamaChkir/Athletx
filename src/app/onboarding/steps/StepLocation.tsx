import { View } from "react-native";
import { Building, Building2, House, PersonStanding } from "lucide-react-native";
import { useOnboardingStore, type LocationType } from "@/store/onboarding-store";
import { SelectList, SelectRow } from "@/components/onboarding/SelectRow";
import { StepTitle } from "@/components/onboarding/StepTitle";

const OPTIONS: { value: LocationType; title: string; description: string; icon: typeof House }[] = [
  { value: "large_gym", title: "Large Gym", description: "Machines, cables and free weights.", icon: Building2 },
  { value: "small_gym", title: "Small Gym / Hotel", description: "Dumbbells, benches and a few machines.", icon: Building },
  { value: "home", title: "Home Gym", description: "Adjustable dumbbells, bands or a basic rack.", icon: House },
  { value: "bodyweight", title: "Bodyweight Only", description: "No equipment, just you.", icon: PersonStanding },
];

export default function StepLocation() {
  const { location, setField } = useOnboardingStore();

  const toggle = (value: LocationType) =>
    setField("location", location.includes(value) ? location.filter((l) => l !== value) : [...location, value]);

  return (
    <View>
      <StepTitle
        title="Where do you"
        highlight="work out?"
        subtitle="Select all that apply. It tells us what equipment you likely have."
      />
      <SelectList>
        {OPTIONS.map((o) => (
          <SelectRow
            key={o.value}
            role="checkbox"
            title={o.title}
            description={o.description}
            icon={o.icon}
            selected={location.includes(o.value)}
            onPress={() => toggle(o.value)}
          />
        ))}
      </SelectList>
    </View>
  );
}
