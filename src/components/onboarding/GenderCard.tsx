import { Pressable, StyleSheet, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { AppText } from "@/components/kit";
import { colors, radius, spacing } from "@/lib/theme";

type Props = {
  label: string;
  description: string;
  icon: LucideIcon;
  /** Icon color; the circle behind it uses the same color, faded. */
  tint: string;
  selected: boolean;
  onPress: () => void;
};

/** Large tappable card with a colored symbol, used for the gender question. */
export function GenderCard({ label, description, icon: Icon, tint, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={[styles.circle, { backgroundColor: `${tint}38` }]}>
        <Icon size={28} color={tint} />
      </View>
      <AppText variant="titleMedium">{label}</AppText>
      <AppText variant="bodyMedium" color="textSecondary" style={styles.description}>
        {description}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.bgSurface,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  cardSelected: { borderColor: colors.accent },
  circle: { width: 56, height: 56, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  description: { textAlign: "center" },
});
