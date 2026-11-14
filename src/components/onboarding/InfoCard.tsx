import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/kit";
import { colors, radius, spacing } from "@/lib/theme";

type Props = {
  label: string;
  message: string;
  /** Color of the outline and label. Defaults to lime. */
  tone?: string;
  /** Extra content under the message, e.g. a small note or a link. */
  children?: ReactNode;
};

/** Outlined card for short guidance under an input (BMI result, goal-weight advice). */
export function InfoCard({ label, message, tone = colors.accent, children }: Props) {
  return (
    <View style={[styles.card, { borderColor: tone }]}>
      <AppText variant="labelLarge" style={{ color: tone }}>
        {label}
      </AppText>
      <AppText variant="bodyMedium" color="textPrimary">
        {message}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.bgSurface,
    borderWidth: 1.5,
  },
});
