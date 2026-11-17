import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowDownToLine, ChevronRight, Dumbbell, Flame, Footprints, Scale, Trophy, type LucideIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { intlLocale, useLanguage } from "@/i18n";
import { AppText, StatCard } from "@/components/kit";
import { BodyWeightCard } from "@/components/body-weight-card";
import { MusclesSection } from "@/components/progress/MusclesSection";
import { SegmentedTabs } from "@/components/progress/SegmentedTabs";
import { compactNumber, currentStreak, entriesInRange, periodRange, groupOfMuscle, type Period } from "@/lib/progress";
import { colors, radius, spacing } from "@/lib/theme";
import { useWeightUnit } from "@/lib/units";
import { fromKg } from "@/lib/weight";
import type { WorkoutHistoryEntry } from "@/lib/types";
import { useWorkoutStore } from "@/store/workout-store";

const PERIOD_IDS = ["week", "month", "year"] as const;

const RECENT_COUNT = 3;

const LEGS = new Set(["quads", "hamstrings", "glutes", "calves", "adductors", "shins"]);
const PULL = new Set(["lats", "traps", "lower-back", "biceps", "forearms"]);

const WORKOUT_ICONS: Record<"legs" | "pull" | "push", LucideIcon> = { legs: Footprints, pull: ArrowDownToLine, push: Dumbbell };

/** Legs, pulling muscles, or pressing muscles (the default), from the muscles the workout trained. */
function workoutKind(entry: WorkoutHistoryEntry): keyof typeof WORKOUT_ICONS {
  const groups = entry.muscles.map((m) => groupOfMuscle(m)?.id).filter((x): x is string => !!x);
  if (groups.length && groups.every((g) => LEGS.has(g))) return "legs";
  if (groups.length && groups.every((g) => PULL.has(g))) return "pull";
  return "push";
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${Math.max(minutes, 1)} min`;
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

function WorkoutCard({ entry, unit }: { entry: WorkoutHistoryEntry; unit: "kg" | "lb" }) {
  const { t } = useTranslation("progress");
  const language = useLanguage();
  const locale = intlLocale(language);
  const Icon = WORKOUT_ICONS[workoutKind(entry)];
  const volume = fromKg(entry.totalVolume, unit).toLocaleString(locale, { maximumFractionDigits: 1 });
  return (
    <View style={styles.workoutCard}>
      <View style={styles.workoutIcon}>
        <Icon size={24} color={colors.textOnAccent} />
      </View>
      <View style={{ flex: 1, gap: spacing.xs }}>
        <AppText variant="titleSmall" numberOfLines={1}>
          {entry.name}
        </AppText>
        <AppText variant="bodyMedium" color="textSecondary">
          {new Date(entry.completedAt).toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" })} · {formatDuration(entry.durationSeconds)}
        </AppText>
        <AppText variant="bodyMedium" color="textSecondary">
          {t("setsCount", { count: entry.totalSets })} · {volume} {unit}
        </AppText>
      </View>
      {entry.prCount ? (
        <View style={styles.prBadge}>
          <Trophy size={14} color={colors.accent} />
          <AppText variant="labelMedium">{t("prCount", { count: entry.prCount })}</AppText>
        </View>
      ) : null}
    </View>
  );
}

export function ProgressScreen() {
  const { t } = useTranslation("progress");
  const periodOptions = PERIOD_IDS.map((p) => ({ value: p, label: t(`periods.${p}`) }));
  const history = useWorkoutStore((s) => s.history);
  const unit = useWeightUnit();
  const [period, setPeriod] = useState<Period>("week");
  const [showAll, setShowAll] = useState(false);

  const stats = useMemo(() => {
    const inPeriod = entriesInRange(history, periodRange(period));
    return {
      workouts: inPeriod.length,
      volume: inPeriod.reduce((sum, h) => sum + h.totalVolume, 0),
      streak: currentStreak(history),
    };
  }, [history, period]);

  const visible = showAll ? history : history.slice(0, RECENT_COUNT);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="titleLarge" style={{ paddingTop: spacing.md }}>
          {t("title")}
        </AppText>

        <SegmentedTabs options={periodOptions} value={period} onChange={setPeriod} />

        <View style={styles.statsRow}>
          <StatCard icon={<Dumbbell size={20} color={colors.accent} />} value={String(stats.workouts)} label={t("stats.workouts")} />
          <StatCard icon={<Flame size={20} color={colors.accent} />} value={String(stats.streak)} unit={t("stats.days")} label={t("stats.streak")} />
          <StatCard
            icon={<Scale size={20} color={colors.accent} />}
            value={compactNumber(fromKg(stats.volume, unit))}
            unit={unit}
            label={t("stats.totalLifted")}
          />
        </View>

        <BodyWeightCard />

        <View style={{ gap: spacing.md }}>
          <View style={styles.sectionHead}>
            <AppText variant="titleSmall">{t("recentWorkouts")}</AppText>
            {history.length > RECENT_COUNT ? (
              <Pressable style={styles.allLink} onPress={() => setShowAll((v) => !v)} accessibilityRole="button">
                <AppText variant="labelLarge" color="accent">
                  {showAll ? t("showLess") : t("showAll", { count: history.length })}
                </AppText>
                <ChevronRight size={16} color={colors.accent} style={showAll ? { transform: [{ rotate: "90deg" }] } : undefined} />
              </Pressable>
            ) : null}
          </View>
          {history.length === 0 ? (
            <View style={styles.empty}>
              <AppText variant="bodyMedium" color="textSecondary" style={{ textAlign: "center" }}>
                {t("emptyHistory")}
              </AppText>
            </View>
          ) : (
            visible.map((entry) => <WorkoutCard key={entry.id} entry={entry} unit={unit} />)
          )}
        </View>

        <MusclesSection />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgApp },
  content: { paddingHorizontal: spacing["2xl"], gap: spacing["2xl"], paddingBottom: 120 },
  statsRow: { flexDirection: "row", gap: spacing.sm },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  allLink: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  workoutCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  prBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    height: 28,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.bgInset,
    alignSelf: "flex-start",
  },
  empty: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, padding: spacing["2xl"] },
});
