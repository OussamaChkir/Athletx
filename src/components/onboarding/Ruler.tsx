import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { AppText } from "@/components/kit";
import { useSnapScroll } from "@/components/onboarding/useSnapScroll";
import { colors } from "@/lib/theme";

const TICK_W = 9;
const TICKS_H = 64;
const LABEL_H = 28;
const MARKER_W = 6;

type Props = {
  min: number;
  max: number;
  /** Value change between two neighboring ticks. */
  step: number;
  /** Starting value. The ruler keeps its own position afterwards. */
  value: number;
  /** A long tick with a number every this many ticks; a medium tick halfway between. `min` must sit on a long tick. */
  majorEvery: number;
  formatLabel: (value: number) => string;
  /** Called while the ruler moves, each time the centered value changes. */
  onScrub?: (value: number) => void;
  /** Called when the ruler comes to rest. */
  onChange: (value: number) => void;
};

/** Horizontal ruler: scroll it under the lime marker to choose a value. */
export function Ruler({ min, max, step, value, majorEvery, formatLabel, onScrub, onChange }: Props) {
  const { width } = useWindowDimensions();
  const count = Math.round((max - min) / step) + 1;
  const toValue = (i: number) => Math.round((min + i * step) * 100) / 100;
  const startIndex = Math.min(count - 1, Math.max(0, Math.round((value - min) / step)));
  const [, setIndex] = useState(startIndex);

  const { ref, scrollProps } = useSnapScroll({
    count,
    itemWidth: TICK_W,
    initialIndex: startIndex,
    onIndexChange: (i) => {
      setIndex(i);
      onScrub?.(toValue(i));
    },
    onSettle: (i) => onChange(toValue(i)),
  });

  // One path per tick kind keeps this to three native shapes however long the ruler is.
  const paths = useMemo(() => {
    const out = { major: "", mid: "", minor: "" };
    const half = majorEvery / 2;
    for (let i = 0; i < count; i++) {
      const x = i * TICK_W + TICK_W / 2;
      const kind = i % majorEvery === 0 ? "major" : i % half === 0 ? "mid" : "minor";
      const len = kind === "major" ? 40 : kind === "mid" ? 28 : 18;
      const y1 = (TICKS_H - len) / 2;
      out[kind] += `M${x} ${y1}V${y1 + len}`;
    }
    return out;
  }, [count, majorEvery]);

  const labels = useMemo(() => {
    const list: { x: number; text: string }[] = [];
    for (let i = 0; i < count; i += majorEvery) list.push({ x: i * TICK_W + TICK_W / 2, text: formatLabel(toValue(i)) });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, majorEvery, formatLabel, min, step]);

  return (
    <View style={{ height: TICKS_H + LABEL_H }}>
      <ScrollView ref={ref} {...scrollProps} contentContainerStyle={{ paddingHorizontal: (width - TICK_W) / 2 }}>
        <View style={{ width: count * TICK_W, height: TICKS_H + LABEL_H }}>
          <Svg width={count * TICK_W} height={TICKS_H}>
            <Path d={paths.minor} stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round" />
            <Path d={paths.mid} stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
            <Path d={paths.major} stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" />
          </Svg>
          {labels.map((l) => (
            <AppText key={l.x} variant="labelLarge" color="textSecondary" numberOfLines={1} allowFontScaling={false} style={[styles.label, { left: l.x - 30 }]}>
              {l.text}
            </AppText>
          ))}
        </View>
      </ScrollView>
      <View style={[styles.marker, { left: (width - MARKER_W) / 2 }]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  marker: { position: "absolute", top: 0, width: MARKER_W, height: TICKS_H, borderRadius: MARKER_W / 2, backgroundColor: colors.accent },
  label: { position: "absolute", top: TICKS_H + 8, width: 60, textAlign: "center" },
});
