import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, spacing } from "@/lib/theme";
import { AppText } from "./AppText";

type Props = {
  label: string;
  onPress?: () => void;
  /** primary = lime, dark = app-background fill with lime text (for use on lime cards). */
  variant?: "primary" | "dark";
  disabled?: boolean;
  /** Optional icon shown before the label. */
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = "primary", disabled, icon, style }: Props) {
  const fill = disabled ? colors.disabledBg : variant === "primary" ? colors.accent : colors.bgApp;
  const textColor = disabled ? "disabledText" : variant === "primary" ? "textOnAccent" : "accent";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.base, { backgroundColor: fill, opacity: pressed ? 0.85 : 1 }, style]}
    >
      <View style={styles.row}>
        {icon}
        <AppText variant="buttonLarge" color={textColor}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.full,
    paddingHorizontal: spacing["2xl"],
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
});
