import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react-native";
import { format } from "date-fns";
import type { Slug } from "react-native-body-highlighter";
import { AppText, Chip } from "@/components/kit";
import { BodyMap, type HeatLevel } from "@/components/progress/BodyMap";
import {
  MUSCLE_GROUPS,
  entriesInRange,
  fatigueByGroup,
  periodRange,
  plannedSetsByGroup,
  rangeDays,
  setsByGroup,
  strengthByGroup,
  targetRange,
  type Period,
} from "@/lib/progress";
import { colors, radius, spacing } from "@/lib/theme";
import { fromKg, roundWeight } from "@/lib/weight";
import { useWeightUnit } from "@/lib/units";
import { useWorkoutStore } from "@/store/workout-store";

type Metric = "sets" | "fatigue" | "strength";
type Mode = "completed" | "planned";
type MusclePeriod = Extract<Period, "week" | "month">;

const METRICS: { value: Metric; label: string }[] = [
  { value: "sets", label: "Sets" },
  { value: "fatigue", label: "Fatigue" },
  { value: "strength", label: "Strength" },
];

const MAX_ROWS = 8;

const levelOf = (ratio: number): HeatLevel => (ratio <= 0 ? 0 : ratio < 0.4 ? 1 : ratio < 0.8 ? 2 : 3);

interface Row {
  id: string;
  label: string;
  /** Big number on the right. */
  value: string;
  /** Small text after it, e.g. "/8–20". */
  hint?: string;
  hintColor?: "textSecondary" | "accent" | "danger";
  /** Bar fill and track, as fractions of the row width. */
  fill: number;
  track: number;
  sortKey: number;
}

export function MusclesSection() {
  const history = useWorkoutStore((s) => s.history);
  const plans = useWorkoutStore((s) => s.plans);
  const activePlanId = useWorkoutStore((s) => s.activePlanId);
  const unit = useWeightUnit();

  const [metric, setMetric] = useState<Metric>("sets");
  const [mode, setMode] = useState<Mode>("completed");
  const [period, setPeriod] = useState<MusclePeriod>("week");
  const [offset, setOffset] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const range = useMemo(() => periodRange(period, offset), [period, offset]);
  const days = rangeDays(range);

  const { rows, heat } = useMemo(() => {
    const heatMap: Partial<Record<Slug, HeatLevel>> = {};
    const raw: Row[] = [];
    const entries = entriesInRange(history, range);

    const paint = (slugs: readonly Slug[], level: HeatLevel) => {
      for (const slug of slugs) heatMap[slug] = Math.max(heatMap[slug] ?? 0, level) as HeatLevel;
    };

    if (metric === "sets") {
      const plan = plans.find((p) => p.id === activePlanId);
      const totals =
        mode === "planned"
          ? new Map([...plannedSetsByGroup(plan?.days ?? [])].map(([id, n]) => [id, Math.round(n * (days / 7) * 10) / 10]))
          : setsByGroup(entries);
      for (const g of MUSCLE_GROUPS) {
        const value = totals.get(g.id) ?? 0;
        const [lo, hi] = targetRange(g, days);
        paint(g.slugs, levelOf(value / Math.max(hi, 1)));
        if (value > 0) {
          raw.push({ id: g.id, label: g.label, value: String(value), hint: `/${lo}–${hi}`, hintColor: "textSecondary", fill: value, track: hi, sortKey: value });
        }
      }
    } else if (metric === "fatigue") {
      const at = offset === 0 ? new Date() : range.end;
      const scores = fatigueByGroup(
        history.filter((h) => new Date(h.completedAt) <= at),
        at,
      );
      for (const g of MUSCLE_GROUPS) {
        const score = scores.get(g.id) ?? 0;
        paint(g.slugs, levelOf(score / 100));
        if (score > 0) raw.push({ id: g.id, label: g.label, value: `${score}%`, fill: score, track: 100, sortKey: score });
      }
    } else {
      const upTo = history.filter((h) => new Date(h.completedAt) <= range.end);
      const previous = strengthByGroup(entriesInRange(history, periodRange(period, offset - 1)));
      const current = strengthByGroup(entries);
      const best = strengthByGroup(upTo);
      for (const g of MUSCLE_GROUPS) {
        const now = current.get(g.id) ?? 0;
        const top = best.get(g.id) ?? 0;
        paint(g.slugs, levelOf(top > 0 ? now / top : 0));
        if (now > 0) {
          const before = previous.get(g.id);
          const change = before ? Math.round(((now - before) / before) * 100) : null;
          raw.push({
            id: g.id,
            label: g.label,
            value: `${roundWeight(fromKg(now, unit), 0)} ${unit}`,
            hint: change == null ? undefined : `${change > 0 ? "+" : ""}${change}%`,
            hintColor: change == null ? "textSecondary" : change >= 0 ? "accent" : "danger",
            fill: now,
            track: top,
            sortKey: now,
          });
        }
      }
    }

    raw.sort((a, b) => b.sortKey - a.sortKey);
    const top = raw.slice(0, MAX_ROWS);
    // Bars share one scale so they can be compared; the track is the target, with a little headroom.
    const scale = Math.max(1, ...top.map((r) => Math.max(r.fill, r.track))) * 1.1;
    return { rows: top.map((r) => ({ ...r, fill: Math.min(r.fill / scale, 1), track: Math.min(r.track / scale, 1) })), heat: heatMap };
  }, [history, plans, activePlanId, metric, mode, range, days, offset, period, unit]);

  const label = period === "week" ? `Week of ${format(range.start, "d MMM")}` : format(range.start, "MMMM yyyy");

  const empty =
    metric === "sets"
      ? mode === "planned"
        ? "No active plan with exercises yet."
        : `No sets logged this ${period}.`
      : metric === "fatigue"
        ? "No workouts in the last week."
        : "Log workouts with weights to see your strength.";

  return (
    <View style={styles.section}>
      <AppText variant="titleSmall">Muscles</AppText>

      <View style={styles.metricRow}>
        {METRICS.map((m) => (
          <Chip key={m.value} label={m.label} selected={metric === m.value} onPress={() => setMetric(m.value)} style={styles.metricChip} />
        ))}
      </View>

      <View style={styles.modeRow}>
        {metric === "sets" ? (
          <View style={styles.modeChips}>
            <Chip label="Completed" selected={mode === "completed"} onPress={() => setMode("completed")} />
            <Chip label="Planned" selected={mode === "planned"} onPress={() => setMode("planned")} />
          </View>
        ) : (
          <View />
        )}
        <View style={styles.periodWrap}>
          <Pressable style={styles.periodButton} onPress={() => setMenuOpen((o) => !o)} accessibilityRole="button" hitSlop={8}>
            <AppText variant="labelLarge" color="accent">
              {period === "week" ? "Week" : "Month"}
            </AppText>
            <ChevronDown size={16} color={colors.accent} />
          </Pressable>
          {menuOpen ? (
            <View style={styles.menu}>
              {(["week", "month"] as const).map((p) => (
                <Pressable
                  key={p}
                  style={styles.menuItem}
                  onPress={() => {
                    setPeriod(p);
                    setOffset(0);
                    setMenuOpen(false);
                  }}
                >
                  <AppText variant="labelLarge" color={p === period ? "accent" : "textPrimary"}>
                    {p === "week" ? "Week" : "Month"}
                  </AppText>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.navRow}>
        <Pressable onPress={() => setOffset((o) => o - 1)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Previous">
          <ChevronLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <AppText variant="labelLarge">{label}</AppText>
        <Pressable
          onPress={() => setOffset((o) => Math.min(0, o + 1))}
          disabled={offset === 0}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Next"
        >
          <ChevronRight size={20} color={offset === 0 ? colors.textMuted : colors.textPrimary} />
        </Pressable>
      </View>

      <BodyMap levels={heat} />

      {rows.length === 0 ? (
        <AppText variant="bodyMedium" color="textSecondary" style={{ textAlign: "center", paddingVertical: spacing.lg }}>
          {empty}
        </AppText>
      ) : (
        <View style={styles.rows}>
          {rows.map((r) => (
            <View key={r.id} style={styles.row}>
              <View style={styles.rowHead}>
                <AppText variant="labelLarge">{r.label}</AppText>
                <View style={styles.rowValue}>
                  <AppText variant="buttonLarge">{r.value}</AppText>
                  {r.hint ? (
                    <AppText variant="caption" color={r.hintColor ?? "textSecondary"}>
                      {" "}
                      {r.hint}
                    </AppText>
                  ) : null}
                </View>
              </View>
              <View style={styles.barTrackArea}>
                <View style={[styles.barTrack, { width: `${r.track * 100}%` }]} />
                <View style={[styles.barFill, { width: `${r.fill * 100}%` }]} />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  metricRow: { flexDirection: "row", gap: spacing.sm },
  metricChip: { flex: 1, height: 44 },
  modeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 10 },
  modeChips: { flexDirection: "row", gap: spacing.sm },
  periodWrap: { alignItems: "flex-end" },
  periodButton: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  menu: {
    position: "absolute",
    top: 28,
    right: 0,
    minWidth: 112,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    padding: spacing.xs,
    elevation: 6,
    zIndex: 20,
    borderWidth: 1,
    borderColor: colors.bgInset,
  },
  menuItem: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rows: { gap: spacing.lg, paddingTop: spacing.sm },
  row: { gap: spacing.sm },
  rowHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  rowValue: { flexDirection: "row", alignItems: "baseline" },
  barTrackArea: { height: 8 },
  barTrack: { position: "absolute", left: 0, top: 0, height: 8, borderRadius: radius.full, backgroundColor: colors.textMuted },
  barFill: { position: "absolute", left: 0, top: 0, height: 8, borderRadius: radius.full, backgroundColor: colors.accent },
});
