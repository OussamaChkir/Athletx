import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Minus, Plus } from "lucide-react-native";
import { AppText, Button } from "@/components/kit";
import { ExerciseCover, formatClock } from "@/components/workout/shared";
import { colors, radius, spacing } from "@/lib/theme";

const RING_SIZE = 240;
const STROKE = 12;
const R = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;
const STEP = 15;

type Props = {
  /** Seconds left, counted down by the parent. */
  remaining: number;
  onAdd: (seconds: number) => void;
  onReduce: (seconds: number) => void;
  onSkip: () => void;
  next: { title: string; detail: string; image?: string; label: string };
};

/** Rest Timer: countdown ring, ±15s, skip, and what comes next. Remounted for every rest. */
export function RestPhase({ remaining, onAdd, onReduce, onSkip, next }: Props) {
  // Length of this rest, so the ring keeps filling correctly when time is added or removed.
  const [total, setTotal] = useState(Math.max(remaining, 1));
  const progress = Math.min(1, Math.max(0, remaining / total));

  const add = () => {
    setTotal((t) => t + STEP);
    onAdd(STEP);
  };
  const reduce = () => onReduce(STEP);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.body}>
        <AppText variant="labelLarge" color="textSecondary" style={styles.eyebrow}>
          REST
        </AppText>

        <View style={styles.ringWrap}>
          <Svg width={RING_SIZE} height={RING_SIZE} style={{ transform: [{ rotate: "-90deg" }] }}>
            <Circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={R} stroke={colors.bgSurface} strokeWidth={STROKE} fill="none" />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={R}
              stroke={colors.accent}
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            />
          </Svg>
          <View style={styles.ringCenter} pointerEvents="none">
            <AppText variant="displayLarge" style={styles.time} accessibilityLiveRegion="polite">
              {formatClock(remaining)}
            </AppText>
          </View>
        </View>

        <View style={styles.adjustRow}>
          <Pressable style={styles.adjust} onPress={reduce} accessibilityRole="button" accessibilityLabel="Remove 15 seconds">
            <Minus size={16} color={colors.textPrimary} />
            <AppText variant="labelLarge">{STEP}s</AppText>
          </Pressable>
          <Pressable style={styles.adjust} onPress={add} accessibilityRole="button" accessibilityLabel="Add 15 seconds">
            <Plus size={16} color={colors.accent} />
            <AppText variant="labelLarge">{STEP}s</AppText>
          </Pressable>
        </View>
      </View>

      <View style={styles.next}>
        <AppText variant="labelMedium" color="textSecondary">
          {next.label}
        </AppText>
        <View style={styles.nextCard}>
          <View style={styles.thumb}>
            <ExerciseCover image={next.image} height={64} badgeTone="inset" badge={null} compact />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="titleSmall" numberOfLines={1}>
              {next.title}
            </AppText>
            <AppText variant="bodyMedium" color="textSecondary" numberOfLines={1}>
              {next.detail}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Skip rest" onPress={onSkip} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing["2xl"] },
  eyebrow: { letterSpacing: 2 },
  ringWrap: { width: RING_SIZE, height: RING_SIZE, alignItems: "center", justifyContent: "center" },
  ringCenter: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: "center" },
  time: { fontSize: 56, lineHeight: 64 },
  adjustRow: { flexDirection: "row", gap: spacing.md },
  adjust: {
    height: 44,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  next: { paddingHorizontal: spacing["2xl"], gap: spacing.sm },
  nextCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  thumb: { width: 64, height: 64 },
  footer: { paddingHorizontal: spacing["2xl"], paddingTop: spacing.lg, paddingBottom: spacing.lg },
});
