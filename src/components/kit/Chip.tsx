import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, spacing } from "@/lib/theme";
import { AppText } from "./AppText";

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Shows a small dot before the label (muscle filters, "Dot Chip" in Figma). */
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Tab Chip / Dot Chip from Figma: lime when selected, surface otherwise. */
export function Chip({ label, selected, onPress, dot, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={[styles.base, { backgroundColor: selected ? colors.accent : colors.bgSurface }, style]}
    >
      <View style={styles.row}>
        {dot ? (
          <View style={[styles.dot, { backgroundColor: selected ? colors.textOnAccent : colors.accent }]} />
        ) : null}
        <AppText variant="labelLarge" color={selected ? "textOnAccent" : "textPrimary"}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 36,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
