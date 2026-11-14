import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/kit";
import { Ruler } from "@/components/onboarding/Ruler";
import type { RulerConfig } from "@/components/onboarding/ruler-configs";
import { fonts, spacing } from "@/lib/theme";

type Props = {
  config: RulerConfig;
  /** Current value in the ruler's own units (null until the user has one). */
  value: number | null;
  /** Where to start when `value` is null. Defaults to the config's fallback. */
  initial?: number;
  /** Called with the value the ruler rests on. Also called once at the start if the incoming value needs to be set or snapped to a tick. */
  onCommit: (value: number) => void;
};

/** A big number readout above a ruler. Remount it (with `key`) when the unit changes. */
export function ValueRuler({ config, value, initial, onCommit }: Props) {
  const start = value ?? initial ?? config.fallback;
  const snapped = Math.min(config.max, Math.max(config.min, Math.round((start - config.min) / config.step) * config.step + config.min));
  const [shown, setShown] = useState(snapped);

  // Make the stored value match what the ruler shows, so Continue works without touching it.
  useEffect(() => {
    if (value !== snapped) onCommit(snapped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const readout = config.formatReadout(shown);

  return (
    <View style={styles.wrap}>
      <View style={styles.readout} accessibilityLiveRegion="polite">
        <AppText style={styles.main} color="accent">
          {readout.main}
        </AppText>
        <AppText variant="titleMedium">{readout.unit}</AppText>
      </View>
      <View style={styles.ruler}>
        <Ruler
          min={config.min}
          max={config.max}
          step={config.step}
          value={snapped}
          majorEvery={config.majorEvery}
          formatLabel={config.formatLabel}
          onScrub={setShown}
          onChange={onCommit}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Bleed to the screen edges: the step content has 24px side padding.
  wrap: { marginHorizontal: -spacing["2xl"], gap: spacing["3xl"], paddingVertical: spacing["3xl"] },
  readout: { flexDirection: "row", alignItems: "baseline", justifyContent: "center", gap: spacing.sm },
  main: { fontFamily: fonts.jostMedium, fontSize: 64, lineHeight: 72 },
  ruler: { height: 92 },
});
