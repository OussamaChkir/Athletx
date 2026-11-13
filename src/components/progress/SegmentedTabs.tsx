import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components/kit";
import { colors, radius, spacing } from "@/lib/theme";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Colour of the track: `surface` on the app background, `inset` inside a surface card. */
  tone?: "surface" | "inset";
};

/** Pill tab bar with a lime selected segment (Week / Month / Year, 1M / 3M / 1Y / All). */
export function SegmentedTabs<T extends string>({ options, value, onChange, tone = "surface" }: Props<T>) {
  return (
    <View style={[styles.track, { backgroundColor: tone === "surface" ? colors.bgSurface : colors.bgInset }]}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, selected && { backgroundColor: colors.accent }]}
          >
            <AppText variant="labelLarge" color={selected ? "textOnAccent" : "textPrimary"}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: "row", borderRadius: radius.full, padding: spacing.xs },
  segment: { flex: 1, height: 40, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
});
