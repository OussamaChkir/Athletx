import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ChevronLeft, ChevronRight, Plus, Target } from "lucide-react-native";
import { format, subDays } from "date-fns";
import { Href, router } from "expo-router";
import { colors, radius, spacing, theme } from "@/lib/theme";
import { AppText } from "@/components/kit";
import { SegmentedTabs } from "@/components/progress/SegmentedTabs";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useWeightStore } from "@/store/weight-store";
import {
  addDays,
  formatWeight,
  fromKg,
  localDateKey,
  parseDateKey,
  roundWeight,
  toKg,
  unitLabel,
  type BodyWeightUnit,
} from "@/lib/weight";
import { BodyWeightChart } from "@/components/body-weight-chart";

export function LogWeightModal({
  visible,
  onClose,
  initialDate,
  initialKg,
}: {
  visible: boolean;
  onClose: () => void;
  initialDate?: string;
  initialKg?: number;
}) {
  const unit = useOnboardingStore((s) => s.weight.unit);
  const setField = useOnboardingStore((s) => s.setField);
  const logWeight = useWeightStore((s) => s.logWeight);
  const displayUnit = unitLabel(unit);

  const [date, setDate] = useState(initialDate ?? localDateKey());
  const [text, setText] = useState("");

  useEffect(() => {
    if (!visible) return;
    const nextDate = initialDate ?? localDateKey();
    setDate(nextDate);
    const kg = initialKg;
    setText(
      kg != null && kg > 0
        ? formatWeight(fromKg(kg, displayUnit), 1)
        : ""
    );
  }, [visible, initialDate, initialKg, displayUnit]);

  const parsed = Number(text.replace(",", "."));
  const canSave = Number.isFinite(parsed) && parsed > 0 && parsed <= 500;

  const save = () => {
    if (!canSave) return;
    const kg = toKg(parsed, displayUnit);
    logWeight(kg, date);
    if (date === localDateKey()) {
      setField("weight", { value: roundWeight(parsed, 1), unit: displayUnit });
    }
    onClose();
  };

  const today = localDateKey();
  const canForward = date < today;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Log body weight</Text>
          <Text style={styles.sheetHint}>One entry per day. Saving again updates that day.</Text>

          <Text style={styles.fieldLabel}>Date</Text>
          <View style={styles.dateRow}>
            <Pressable
              onPress={() => setDate((d) => addDays(d, -1))}
              style={styles.dateBtn}
              hitSlop={8}
            >
              <ChevronLeft size={20} color={theme.text} />
            </Pressable>
            <Text style={styles.dateValue}>
              {format(parseDateKey(date), "EEE d MMM")}
            </Text>
            <Pressable
              onPress={() => canForward && setDate((d) => addDays(d, 1))}
              style={[styles.dateBtn, !canForward && { opacity: 0.3 }]}
              disabled={!canForward}
              hitSlop={8}
            >
              <ChevronRight size={20} color={theme.text} />
            </Pressable>
          </View>

          <Text style={styles.fieldLabel}>Weight</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={text}
              onChangeText={setText}
              keyboardType="decimal-pad"
              placeholder={displayUnit === "kg" ? "e.g. 78.3" : "e.g. 172.5"}
              placeholderTextColor={theme.muted}
              style={styles.input}
              autoFocus
            />
            <Text style={styles.inputUnit}>{displayUnit}</Text>
          </View>

          <View style={styles.sheetActions}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={save}
              style={[styles.saveBtn, !canSave && { opacity: 0.4 }]}
              disabled={!canSave}
            >
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const RANGES = [
  { value: "1M", label: "1M", days: 30 },
  { value: "3M", label: "3M", days: 90 },
  { value: "1Y", label: "1Y", days: 365 },
  { value: "All", label: "All", days: null },
] as const;
type RangeValue = (typeof RANGES)[number]["value"];

export function BodyWeightCard() {
  const weight = useOnboardingStore((s) => s.weight);
  const goalWeight = useOnboardingStore((s) => s.goalWeight);
  const entries = useWeightStore((s) => s.entries);
  const seedFromProfile = useWeightStore((s) => s.seedFromProfile);

  const [logOpen, setLogOpen] = useState(false);
  const [chartWidth, setChartWidth] = useState(0);
  const [range, setRange] = useState<RangeValue>("3M");

  const unit: BodyWeightUnit = unitLabel(weight.unit);

  useEffect(() => {
    const seed = () => {
      if (weight.value && weight.value > 0) {
        seedFromProfile(toKg(weight.value, unit));
      }
    };
    if (useWeightStore.persist.hasHydrated()) seed();
    return useWeightStore.persist.onFinishHydration(seed);
  }, [seedFromProfile, weight.value, unit]);

  const latest = entries[entries.length - 1];
  const goalDisplay = goalWeight != null ? goalWeight : null;

  const chartPoints = useMemo(() => {
    const days = RANGES.find((r) => r.value === range)?.days ?? null;
    const cutoff = days == null ? null : localDateKey(subDays(new Date(), days));
    return entries
      .filter((e) => cutoff == null || e.date >= cutoff)
      .map((e) => ({ date: e.date, value: fromKg(e.kg, unit) }));
  }, [entries, range, unit]);

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.topRow}>
        <AppText variant="labelLarge" color="textSecondary">
          Body weight
        </AppText>
        <View style={cardStyles.topRight}>
          {goalDisplay != null ? (
            <View style={cardStyles.goalChip}>
              <Target size={18} color={colors.accent} />
              <AppText variant="labelLarge" color="accent">
                {formatWeight(goalDisplay, goalDisplay % 1 === 0 ? 0 : 1)}
              </AppText>
            </View>
          ) : null}
          <Pressable onPress={() => setLogOpen(true)} style={cardStyles.logBtn} hitSlop={8} accessibilityRole="button">
            <Plus size={16} color={colors.accent} />
            <AppText variant="labelLarge" color="accent">
              Log
            </AppText>
          </Pressable>
        </View>
      </View>

      <SegmentedTabs tone="inset" options={RANGES} value={range} onChange={setRange} />

      <View style={cardStyles.chartWrap} onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}>
        <BodyWeightChart points={chartPoints} goal={goalDisplay} width={chartWidth} />
      </View>

      <Pressable onPress={() => router.push("/weigh-ins" as Href)} style={cardStyles.allLink} accessibilityRole="button">
        <AppText variant="labelLarge" color="accent">
          All weigh-ins
        </AppText>
        <ChevronRight size={16} color={colors.accent} />
      </Pressable>

      <LogWeightModal
        visible={logOpen}
        onClose={() => setLogOpen(false)}
        initialKg={latest?.kg ?? (weight.value ? toKg(weight.value, unit) : undefined)}
      />
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  topRight: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  goalChip: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  logBtn: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  chartWrap: { width: "100%", minHeight: 168 },
  allLink: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: spacing.xs },
});

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 20,
    paddingBottom: 32,
  },
  sheetTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: "900",
  },
  sheetHint: {
    color: theme.muted,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 18,
  },
  fieldLabel: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  dateBtn: {
    width: 40,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  dateValue: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "800",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    color: theme.text,
    fontSize: 22,
    fontWeight: "800",
    paddingVertical: 14,
  },
  inputUnit: {
    color: theme.muted,
    fontWeight: "800",
    fontSize: 14,
  },
  sheetActions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cancelText: {
    color: theme.muted,
    fontWeight: "800",
  },
  saveBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.neon,
  },
  saveText: {
    color: theme.background,
    fontWeight: "900",
  },
});
