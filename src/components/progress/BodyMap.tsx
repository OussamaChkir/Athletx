import { StyleSheet, View } from "react-native";
import Body, { type ExtendedBodyPart, type Slug } from "react-native-body-highlighter";
import { AppText } from "@/components/kit";
import { colors, spacing } from "@/lib/theme";

/** 0 = untouched, 1 = a little, 3 = a lot. */
export type HeatLevel = 0 | 1 | 2 | 3;

const LEVEL_COLORS = [colors.heatLow, colors.accentSoft, colors.accent] as const;
const UNTRAINED = "#44444d";
const NON_MUSCLE = "#34343d";
const NON_MUSCLE_PARTS: Slug[] = ["head", "hair", "neck", "hands", "feet", "ankles", "knees"];

const SCALE = 0.5; // the package draws a figure at 200 x 400 for scale 1

/** Front and back body figures with each muscle tinted by its heat level. */
export function BodyMap({ levels }: { levels: Partial<Record<Slug, HeatLevel>> }) {
  const data: ExtendedBodyPart[] = [
    ...NON_MUSCLE_PARTS.map((slug) => ({ slug, styles: { fill: NON_MUSCLE } })),
    ...(Object.entries(levels) as [Slug, HeatLevel][])
      .filter(([, level]) => level > 0)
      .map(([slug, level]) => ({ slug, intensity: level })),
  ];

  const figure = (side: "front" | "back") => (
    <Body data={data} side={side} gender="male" scale={SCALE} border="none" colors={LEVEL_COLORS} defaultFill={UNTRAINED} />
  );

  return (
    <View style={styles.card}>
      <View style={styles.figures}>
        {figure("front")}
        {figure("back")}
      </View>
      <View style={styles.legend}>
        <AppText variant="caption" color="textSecondary">
          Less
        </AppText>
        {[UNTRAINED, ...LEVEL_COLORS].map((c) => (
          <View key={c} style={[styles.legendDot, { backgroundColor: c }]} />
        ))}
        <AppText variant="caption" color="textSecondary">
          More
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.bgSurface, borderRadius: 24, padding: spacing.lg, gap: spacing.sm },
  figures: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  legend: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: spacing.sm },
  legendDot: { width: 14, height: 14, borderRadius: 7 },
});
