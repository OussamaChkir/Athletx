import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors, spacing } from "@/lib/theme";
import { AppText } from "./AppText";

type Props = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  /** Destructive rows (Log out) use the danger color for the title. */
  danger?: boolean;
  /** Hides the chevron, e.g. for rows that show a switch or text on the right. */
  hideChevron?: boolean;
};

/** Settings Row from Figma: round icon, title, subtitle and a lime chevron. */
export function ListRow({ icon, title, subtitle, onPress, danger, hideChevron }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={styles.iconCircle}>{icon}</View>
      <View style={styles.text}>
        <AppText variant="titleSmall" color={danger ? "danger" : "textPrimary"}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="bodyMedium" color="textSecondary">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {hideChevron ? null : <ChevronRight size={16} color={colors.accent} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgInset,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, gap: spacing.xs },
});
