import { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { AppText } from "@/components/kit";
import { colors, radius, spacing } from "@/lib/theme";

type Props = {
  step: number;
  total: number;
  onBack: () => void;
};

/** Back button, progress bar and "3/14" counter shown above every onboarding step. */
export function OnboardingHeader({ step, total, onBack }: Props) {
  const progress = Math.min(Math.max(step / total, 0), 1);
  const [animated] = useState(() => new Animated.Value(progress));

  useEffect(() => {
    Animated.timing(animated, { toValue: progress, duration: 300, useNativeDriver: false }).start();
  }, [animated, progress]);

  return (
    <View style={styles.row}>
      <Pressable style={styles.back} onPress={onBack} accessibilityRole="button" accessibilityLabel="Back">
        <ChevronLeft size={20} color={colors.textPrimary} />
      </Pressable>
      <View style={styles.track}>
        <Animated.View
          style={[styles.fill, { width: animated.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]}
        />
      </View>
      <AppText variant="labelMedium" color="textSecondary" style={styles.count}>
        {step}/{total}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing["2xl"], paddingVertical: spacing.sm },
  back: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.bgSurface, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3, backgroundColor: colors.accent },
  count: { minWidth: 34, textAlign: "right" },
});
