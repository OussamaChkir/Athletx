import { Text, type TextProps } from "react-native";
import { colors, typography, type ColorToken, type TypographyVariant } from "@/lib/theme";

type Props = TextProps & {
  /** Figma text style, e.g. "titleLarge" = Title/Large. */
  variant?: TypographyVariant;
  /** Semantic color token, e.g. "textSecondary" = text/secondary. */
  color?: ColorToken;
};

/** Text that always uses the design-system fonts (custom fonts need an explicit family per weight). */
export function AppText({ variant = "bodyMedium", color = "textPrimary", style, ...rest }: Props) {
  return <Text {...rest} style={[typography[variant], { color: colors[color] }, style]} />;
}
