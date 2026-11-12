import type { TextStyle } from "react-native";

/**
 * Athletx design tokens, mirrored from the Figma file "Athletx Redesign v2".
 * Figma variable names are noted in comments so the two stay easy to compare.
 */

/** Primitive colors (Figma collection "Primitives"). */
export const palette = {
  paleLime: "#d5ff5f",
  paleLimeLight: "#e4ff94", // derived lighter lime, not in the original palette
  cottonSeed: "#f3f3f3",
  cottonSeedDark: "#bababa",
  midGrey: "#656566",
  raisinBlack: "#1e1e25",
  outerSpace: "#2d2d36",
  coral: "#ff6b6b", // added for destructive actions (Log out)
} as const;

/** Semantic colors (Figma collection "Color", Dark mode). */
export const colors = {
  bgApp: palette.raisinBlack, // bg/app
  bgSurface: palette.outerSpace, // bg/surface
  bgInset: palette.raisinBlack, // bg/inset (darker area on top of a surface)
  textPrimary: palette.cottonSeed, // text/primary
  textSecondary: palette.cottonSeedDark, // text/secondary
  textMuted: palette.midGrey, // text/muted
  textOnAccent: palette.raisinBlack, // text/on-accent
  accent: palette.paleLime, // accent/primary
  accentSoft: palette.paleLimeLight, // accent/soft
  disabledBg: palette.outerSpace, // disabled/bg
  disabledText: palette.midGrey, // disabled/text
  heatLow: palette.midGrey, // heat/low
  danger: palette.coral, // danger
} as const;

/** Spacing scale (Figma collection "Spacing"). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
} as const;

/** Corner radius scale (Figma collection "Radius"). */
export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 999,
} as const;

/**
 * Font family names as registered by `useAppFonts` (see src/lib/fonts.ts).
 * Custom fonts need one family per weight, so `fontWeight` is not used with them.
 */
export const fonts = {
  jostRegular: "Jost_400Regular",
  jostMedium: "Jost_500Medium",
  jakartaRegular: "PlusJakartaSans_400Regular",
  jakartaSemiBold: "PlusJakartaSans_600SemiBold",
  jakartaBold: "PlusJakartaSans_700Bold",
} as const;

/** Text styles (Figma text styles). Line heights are chosen for readability. */
export const typography = {
  displayLarge: { fontFamily: fonts.jostMedium, fontSize: 34, lineHeight: 40 }, // Display/Large
  titleLarge: { fontFamily: fonts.jostMedium, fontSize: 28, lineHeight: 34 }, // Title/Large
  titleMedium: { fontFamily: fonts.jostMedium, fontSize: 22, lineHeight: 28 }, // Title/Medium
  titleSmall: { fontFamily: fonts.jostMedium, fontSize: 18, lineHeight: 24 }, // Title/Small
  caption: { fontFamily: fonts.jostRegular, fontSize: 12, lineHeight: 16 }, // Caption
  statNumber: { fontFamily: fonts.jakartaBold, fontSize: 24, lineHeight: 30 }, // Stat/Number
  buttonLarge: { fontFamily: fonts.jakartaBold, fontSize: 16, lineHeight: 20 }, // Button/Large
  bodyLarge: { fontFamily: fonts.jakartaRegular, fontSize: 16, lineHeight: 24 }, // Body/Large
  bodyMedium: { fontFamily: fonts.jakartaRegular, fontSize: 14, lineHeight: 20 }, // Body/Medium
  labelLarge: { fontFamily: fonts.jakartaSemiBold, fontSize: 14, lineHeight: 20 }, // Label/Large
  labelMedium: { fontFamily: fonts.jakartaSemiBold, fontSize: 12, lineHeight: 16 }, // Label/Medium
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
export type ColorToken = keyof typeof colors;

/**
 * Legacy theme object. The key names are unchanged so every existing screen picks up the
 * new palette automatically; screens are moved to `colors` / `typography` one by one.
 */
export const theme = {
  background: colors.bgApp,
  surface: colors.bgSurface,
  surfaceRaised: colors.bgInset,
  text: colors.textPrimary,
  muted: colors.textSecondary,
  neon: colors.accent,
  ember: "#ff7043", // not part of the new palette yet; used for "moving away from goal" states
  border: colors.bgSurface,
  danger: colors.danger,
} as const;
