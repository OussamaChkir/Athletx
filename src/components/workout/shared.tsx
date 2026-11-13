import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Dumbbell, X } from "lucide-react-native";
import { AppText } from "@/components/kit";
import { getExerciseImageSource } from "@/lib/exercise-image";
import { colors, radius, spacing } from "@/lib/theme";

/** 5 → "5:00", 75 → "1:15". */
export function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.max(0, totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Elapsed workout time: "24:18", or "1:05:09" past an hour. */
export function formatElapsed(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

/** Close button, workout clock and a spacer, shared by the live and rest screens. */
export function LiveHeader({ elapsed, onClose }: { elapsed: number; onClose: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.closeButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="End workout">
        <X size={20} color={colors.textPrimary} />
      </Pressable>
      <AppText variant="titleSmall" style={styles.clock}>
        {formatElapsed(elapsed)}
      </AppText>
      <View style={styles.closeButton} />
    </View>
  );
}

/** Exercise picture on a surface card with a badge in the corner. */
export function ExerciseCover({
  image,
  badge,
  badgeTone,
  height,
  compact,
}: {
  image?: string;
  badge: ReactNode;
  badgeTone: "inset" | "accent";
  height: number;
  /** Small thumbnail: tighter corners, no badge. */
  compact?: boolean;
}) {
  return (
    <View style={[styles.cover, { height }, compact && { borderRadius: radius.md, backgroundColor: colors.bgInset }]}>
      {image ? (
        <Image source={getExerciseImageSource(image)} style={styles.coverImage} contentFit="contain" transition={200} />
      ) : (
        <Dumbbell size={compact ? 24 : 48} color={colors.textMuted} />
      )}
      {compact ? null : (
        <View style={[styles.badge, { backgroundColor: badgeTone === "accent" ? colors.accent : colors.bgInset }]}>
          {badge}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing["2xl"],
    paddingVertical: spacing.sm,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  clock: { flex: 1, textAlign: "center" },
  cover: {
    borderRadius: radius.lg,
    backgroundColor: colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  coverImage: { width: "100%", height: "100%" },
  badge: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    height: 28,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    justifyContent: "center",
  },
});
