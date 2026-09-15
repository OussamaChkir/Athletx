import { StyleSheet, Text, View } from "react-native";
import { Building2, Building, Home, User } from "lucide-react-native";
import { useOnboardingStore, LocationType } from "@/store/onboarding-store";
import { theme } from "@/lib/theme";
import { CheckboxCard } from "@/components/onboarding/CheckboxCard";

export default function StepLocation() {
  const { location, setField } = useOnboardingStore();

  const toggleLocation = (loc: LocationType) => {
    if (location.includes(loc)) {
      setField("location", location.filter((l) => l !== loc));
    } else {
      setField("location", [...location, loc]);
    }
  };

  return (
    <View>
      <Text style={styles.title1}>WHERE DO YOU</Text>
      <Text style={styles.title2}>WORK OUT?</Text>
      
      <Text style={styles.subtitle}>
        Select all that apply. This helps us know what equipment you likely have access to.
      </Text>

      <View style={styles.options}>
        <CheckboxCard
          title="Large Gym"
          description="Commercial gym with machines, cables, and free weights."
          icon={Building2}
          selected={location.includes("large_gym")}
          onToggle={() => toggleLocation("large_gym")}
        />
        <CheckboxCard
          title="Small Gym / Hotel"
          description="Basic dumbbells, benches, and limited machines."
          icon={Building}
          selected={location.includes("small_gym")}
          onToggle={() => toggleLocation("small_gym")}
        />
        <CheckboxCard
          title="Home Gym"
          description="Adjustable dumbbells, bands, or a basic rack."
          icon={Home}
          selected={location.includes("home")}
          onToggle={() => toggleLocation("home")}
        />
        <CheckboxCard
          title="Bodyweight Only"
          description="No equipment, just your own body weight."
          icon={User}
          selected={location.includes("bodyweight")}
          onToggle={() => toggleLocation("bodyweight")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title1: {
    color: theme.text,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 36,
  },
  title2: {
    color: theme.neon,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 36,
    marginBottom: 16,
  },
  subtitle: {
    color: theme.muted,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 32,
  },
  options: {
    gap: 12,
  },
});
