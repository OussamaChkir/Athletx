import { Pressable, StyleSheet, View } from "react-native";
import { Check, type LucideIcon } from "lucide-react-native";
import { AppText } from "@/components/kit";
import { colors, radius, spacing } from "@/lib/theme";

type Props = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  selected: boolean;
  onPress: () => void;
  /** Greyed out and not pressable (used when a selection limit is reached). */
  disabled?: boolean;
  /** "radio" for pick-one lists, "checkbox" for pick-many lists. Looks the same; changes how screen readers announce it. */
  role?: "radio" | "checkbox";
};

/** Option row: lime icon, label and a checkbox, with a lime outline when selected. */
export function SelectRow({ title, description, icon: Icon, selected, onPress, disabled, role = "radio" }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={role}
      accessibilityState={{ checked: selected, disabled: !!disabled }}
      style={[styles.row, selected && styles.rowSelected, disabled && styles.rowDisabled]}
    >
      {Icon ? <Icon size={24} color={colors.accent} /> : null}
      <View style={styles.text}>
        <AppText variant="titleSmall">{title}</AppText>
        {description ? (
          <AppText variant="bodyMedium" color="textSecondary">
            {description}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.box, selected && styles.boxSelected]}>
        {selected ? <Check size={16} color={colors.textOnAccent} strokeWidth={3} /> : null}
      </View>
    </Pressable>
  );
}

/** The vertical stack every select step puts its rows in. */
export function SelectList({ children }: { children: React.ReactNode }) {
  return <View style={styles.list}>{children}</View>;
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md + 2,
    minHeight: 60,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.bgSurface,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  rowSelected: { borderColor: colors.accent },
  rowDisabled: { opacity: 0.45 },
  text: { flex: 1, gap: 2 },
  box: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  boxSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
});
