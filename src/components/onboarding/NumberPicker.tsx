import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { AppText } from "@/components/kit";
import { useSnapScroll } from "@/components/onboarding/useSnapScroll";
import { colors, fonts, radius, spacing } from "@/lib/theme";

// Wide enough for a two-digit number at the largest size, with room to spare.
const ITEM_W = 84;
const HEIGHT = 240;

type Props = {
  min: number;
  max: number;
  /** Starting value. The picker keeps its own position afterwards. */
  value: number;
  /** Called when the scroll settles on a number (or a number is tapped). */
  onChange: (value: number) => void;
  /** Small label under the selected number, e.g. "years". */
  unit: string;
};

// Size and opacity by distance from the selected number.
const LOOK = [
  { size: 56, opacity: 1 },
  { size: 32, opacity: 0.5 },
  { size: 26, opacity: 0.28 },
] as const;

/** Horizontal number wheel: the selected number is large and centered, with a soft lime glow behind it. */
export function NumberPicker({ min, max, value, onChange, unit }: Props) {
  const { width } = useWindowDimensions();
  const values = useMemo(() => Array.from({ length: max - min + 1 }, (_, i) => min + i), [min, max]);
  const [active, setActive] = useState(Math.min(max, Math.max(min, value)) - min);

  const { ref, scrollProps, scrollToIndex } = useSnapScroll({
    count: values.length,
    itemWidth: ITEM_W,
    initialIndex: active,
    onIndexChange: setActive,
    onSettle: (i) => onChange(min + i),
  });

  return (
    <View style={{ height: HEIGHT, justifyContent: "center" }}>
      <Svg width={width} height={HEIGHT} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="pickerGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={colors.accent} stopOpacity={0.16} />
            <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={HEIGHT} fill="url(#pickerGlow)" />
      </Svg>

      <ScrollView
        ref={ref}
        {...scrollProps}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: (width - ITEM_W) / 2, alignItems: "center" }}
      >
        {values.map((v, i) => {
          const look = LOOK[Math.min(Math.abs(i - active), 2)];
          return (
            <Pressable
              key={v}
              style={styles.item}
              onPress={() => {
                scrollToIndex(i);
                setActive(i);
                onChange(v);
              }}
              accessibilityRole="adjustable"
              accessibilityLabel={`${v} ${unit}`}
              accessibilityState={{ selected: i === active }}
            >
              <AppText
                numberOfLines={1}
                allowFontScaling={false}
                style={[styles.number, { fontSize: look.size, lineHeight: look.size * 1.25, opacity: look.opacity }]}
              >
                {v}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.footer} pointerEvents="none">
        <View style={styles.indicator} />
        <AppText variant="labelLarge" color="textSecondary">
          {unit}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { width: ITEM_W, height: 96, alignItems: "center", justifyContent: "center" },
  number: { fontFamily: fonts.jostMedium, textAlign: "center", width: "100%" },
  footer: { alignItems: "center", gap: spacing.sm, marginTop: spacing.sm },
  indicator: { width: 32, height: 4, borderRadius: radius.full, backgroundColor: colors.accent },
});
