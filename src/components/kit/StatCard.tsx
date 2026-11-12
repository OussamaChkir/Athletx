import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, spacing } from "@/lib/theme";
import { AppText } from "./AppText";

type Props = {
  icon?: ReactNode;
  value: string;
  unit?: string;
  label: string;
  style?: StyleProp<ViewStyle>;
};

/** Stat Card from Figma: icon, big number with optional unit, and a label. */
export function StatCard({ icon, value, unit, label, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      {icon}
      <View style={styles.valueRow}>
        <AppText variant="statNumber">{value}</AppText>
        {unit ? (
          <AppText variant="labelMedium" color="textMuted">
            {unit}
          </AppText>
        ) : null}
      </View>
      <AppText variant="labelMedium" color="textSecondary">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  valueRow: { flexDirection: "row", alignItems: "baseline", gap: spacing.xs },
});
