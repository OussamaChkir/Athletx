import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components/kit";
import { colors, radius } from "@/lib/theme";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: [Option<T>, Option<T>];
  value: T;
  onChange: (value: T) => void;
};

/** Two-option pill switch, e.g. CM | FT or KG | LB. */
export function UnitToggle<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            style={[styles.segment, on && styles.segmentOn]}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
          >
            <AppText variant="labelLarge" color={on ? "textOnAccent" : "textSecondary"}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: "row", padding: 4, borderRadius: radius.full, backgroundColor: colors.bgSurface },
  segment: { flex: 1, height: 40, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  segmentOn: { backgroundColor: colors.accent },
});
