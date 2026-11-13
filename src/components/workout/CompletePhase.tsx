import { ScrollView, Share, StyleSheet, View } from "react-native";
import { Check, Share2, Trophy } from "lucide-react-native";
import { AppText, Button, StatCard } from "@/components/kit";
import { formatElapsed } from "@/components/workout/shared";
import { compactNumber, type PersonalRecord } from "@/lib/progress";
import { colors, radius, spacing } from "@/lib/theme";
import { fromKg, roundWeight, type BodyWeightUnit } from "@/lib/weight";
import type { HistoryExercise } from "@/lib/types";

type Props = {
  workoutName: string;
  elapsed: number;
  /** Total lifted, in kg. */
  volumeKg: number;
  totalSets: number;
  exercises: HistoryExercise[];
  records: PersonalRecord[];
  unit: BodyWeightUnit;
  onDone: () => void;
};

const show = (kg: number, unit: BodyWeightUnit) => `${roundWeight(fromKg(kg, unit), 1)} ${unit}`;

/** Workout Complete. Shows the personal-records version when at least one lift beat its history. */
export function CompletePhase({ workoutName, elapsed, volumeKg, totalSets, exercises, records, unit, onDone }: Props) {
  const hasRecords = records.length > 0;
  const volume = `${compactNumber(Math.round(fromKg(volumeKg, unit)))}`;

  const share = () => {
    const lines = [
      `${workoutName} done with Athletx 💪`,
      `${formatElapsed(elapsed)} · ${totalSets} sets${volumeKg > 0 ? ` · ${volume} ${unit} lifted` : ""}`,
      ...records.map((r) => `🏆 New PR: ${r.title} ${show(r.weight, unit)} × ${r.reps}`),
    ];
    Share.share({ message: lines.join("\n") }).catch(() => undefined);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.heroBadge, hasRecords && styles.heroBadgePr]}>
            {hasRecords ? <Trophy size={40} color={colors.textOnAccent} /> : <Check size={40} color={colors.accent} />}
          </View>
          <AppText variant="displayLarge" style={{ textAlign: "center" }}>
            {hasRecords ? (records.length > 1 ? `${records.length} new records!` : "New record!") : "Workout complete"}
          </AppText>
          <AppText variant="bodyLarge" color="textSecondary" style={{ textAlign: "center" }}>
            {hasRecords ? `You beat your best in ${workoutName}.` : `${workoutName} is in the books. Nice work.`}
          </AppText>
        </View>

        <View style={styles.statRow}>
          <StatCard value={formatElapsed(elapsed)} label="Time" />
          <StatCard value={volumeKg > 0 ? volume : "—"} unit={volumeKg > 0 ? unit : undefined} label="Lifted" />
          <StatCard value={String(totalSets)} label="Sets" />
        </View>

        {hasRecords ? (
          <View style={{ gap: spacing.md }}>
            <AppText variant="titleMedium">Personal records</AppText>
            {records.map((r) => (
              <View key={r.exerciseId} style={styles.prCard}>
                <View style={styles.prIcon}>
                  <Trophy size={18} color={colors.textOnAccent} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="titleSmall" numberOfLines={1}>
                    {r.title}
                  </AppText>
                  <AppText variant="bodyMedium" color="textSecondary">
                    Previous best {show(r.previousWeight, unit)}
                  </AppText>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <AppText variant="titleSmall" color="accent">
                    {show(r.weight, unit)}
                  </AppText>
                  <AppText variant="bodyMedium" color="textSecondary">
                    × {r.reps}
                  </AppText>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View style={{ gap: spacing.md }}>
          <AppText variant="titleMedium">Summary</AppText>
          <View style={styles.summary}>
            {exercises.length === 0 ? (
              <AppText variant="bodyMedium" color="textSecondary">
                No sets were logged.
              </AppText>
            ) : (
              exercises.map((e, i) => (
                <View key={e.exerciseId + i} style={[styles.summaryRow, i > 0 && styles.summaryDivider]}>
                  <AppText variant="titleSmall" style={{ flex: 1 }} numberOfLines={1}>
                    {e.title}
                  </AppText>
                  <AppText variant="bodyMedium" color="textSecondary">
                    {e.sets.length} {e.sets.length === 1 ? "set" : "sets"}
                    {bestLabel(e, unit)}
                  </AppText>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {hasRecords ? (
          <Button label="Share" variant="dark" icon={<Share2 size={18} color={colors.accent} />} onPress={share} style={styles.shareBtn} />
        ) : null}
        <Button label="Done" onPress={onDone} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

/** " · best 80 kg × 8" for the heaviest set, if any weight was logged. */
function bestLabel(e: HistoryExercise, unit: BodyWeightUnit) {
  let best: { reps: number; weight: number } | null = null;
  for (const s of e.sets) {
    if (!s.weight) continue;
    if (!best || s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps)) best = { reps: s.reps, weight: s.weight };
  }
  return best ? ` · ${show(best.weight, unit)} × ${best.reps}` : "";
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing["2xl"], paddingTop: spacing["2xl"], paddingBottom: spacing.xl, gap: spacing["2xl"] },
  hero: { alignItems: "center", gap: spacing.md },
  heroBadge: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  heroBadgePr: { backgroundColor: colors.accent },
  statRow: { flexDirection: "row", gap: spacing.md },
  prCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  prIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  summary: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, paddingHorizontal: spacing.lg },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.lg },
  summaryDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.textMuted },
  footer: { flexDirection: "row", gap: spacing.md, paddingHorizontal: spacing["2xl"], paddingVertical: spacing.lg },
  shareBtn: { flex: 1 },
});
