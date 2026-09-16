import { useLocalSearchParams } from "expo-router";
import { WorkoutDetailScreen } from "@/components/screens";

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <WorkoutDetailScreen id={id} />;
}
