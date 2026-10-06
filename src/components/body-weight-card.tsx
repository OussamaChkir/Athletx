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
import { format } from "date-fns";
import { Href, router } from "expo-router";
import { theme } from "@/lib/theme";
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

const GOAL_GOLD = "#e8c84a";

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

export function BodyWeightCard() {
  const weight = useOnboardingStore((s) => s.weight);
  const goalWeight = useOnboardingStore((s) => s.goalWeight);
  const entries = useWeightStore((s) => s.entries);
  const seedFromProfile = useWeightStore((s) => s.seedFromProfile);

  const [logOpen, setLogOpen] = useState(false);
  const [chartWidth, setChartWidth] = useState(0);

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
  const previous = entries[entries.length - 2];

  const currentDisplay = latest
    ? fromKg(latest.kg, unit)
    : weight.value != null
      ? weight.value
      : null;

  const goalDisplay = goalWeight != null ? goalWeight : null;

  const delta = useMemo(() => {
    if (!latest || !previous) return null;
    return fromKg(latest.kg, unit) - fromKg(previous.kg, unit);
  }, [latest, previous, unit]);

  const goalDelta =
    currentDisplay != null && goalDisplay != null
      ? roundWeight(currentDisplay - goalDisplay, 1)
      : null;

  const towardGoalGood =
    goalDelta == null
      ? true
      : goalDelta > 0
        ? (delta ?? 0) < 0
        : goalDelta < 0
          ? (delta ?? 0) > 0
          : true;

  const chartPoints = entries.map((e) => ({
    date: e.date,
    value: fromKg(e.kg, unit),
  }));

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.cardTitle}>Body weight</Text>
        <View style={styles.topRight}>
          {goalDisplay != null ? (
            <View style={styles.goalChip}>
              <Target size={12} color={GOAL_GOLD} />
              <Text style={styles.goalChipText}>
                {formatWeight(goalDisplay, goalDisplay % 1 === 0 ? 0 : 1)}
              </Text>
            </View>
          ) : null}
          <Pressable onPress={() => setLogOpen(true)} style={styles.logBtn} hitSlop={6}>
            <Plus size={14} color={theme.neon} />
            <Text style={styles.logBtnText}>Log</Text>
          </Pressable>
        </View>
      </View>

      {currentDisplay != null ? (
        <View style={styles.heroRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.currentRow}>
              <Text style={styles.currentValue}>{formatWeight(currentDisplay, 1)}</Text>
              <Text style={styles.currentUnit}>{unit}</Text>
              {delta != null && Math.abs(delta) >= 0.05 ? (
                <Text
                  style={[
                    styles.delta,
                    { color: towardGoalGood ? theme.neon : theme.ember },
                  ]}
                >
                  {delta > 0 ? "↑" : "↓"} {formatWeight(Math.abs(delta), 1)}
                </Text>
              ) : null}
            </View>
          </View>
          {latest ? (
            <Text style={styles.heroDate}>
              {format(parseDateKey(latest.date), "EEE d MMM")}
            </Text>
          ) : null}
        </View>
      ) : (
        <Text style={styles.emptyCopy}>Log today’s weight to start your trend.</Text>
      )}

      {goalDisplay != null && currentDisplay != null && goalDelta != null ? (
        <View style={styles.goalRow}>
          <Target size={14} color={GOAL_GOLD} />
          <Text style={styles.goalLine}>
            Goal {formatWeight(goalDisplay, goalDisplay % 1 === 0 ? 0 : 1)} {unit}
            {" · "}
            {Math.abs(goalDelta) < 0.05
              ? "Goal reached"
              : goalDelta > 0
                ? `${formatWeight(goalDelta, 1)} ${unit} to lose`
                : `${formatWeight(Math.abs(goalDelta), 1)} ${unit} to gain`}
          </Text>
        </View>
      ) : null}

      <View
        style={styles.chartWrap}
        onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
      >
        <BodyWeightChart
          points={chartPoints}
          goal={goalDisplay}
          width={chartWidth}
        />
      </View>

      <Pressable
        onPress={() => router.push("/weigh-ins" as Href)}
        style={styles.allLink}
      >
        <Text style={styles.allLinkText}>All weigh-ins</Text>
        <Text style={styles.allLinkChevron}>›</Text>
      </Pressable>

      <LogWeightModal
        visible={logOpen}
        onClose={() => setLogOpen(false)}
        initialKg={latest?.kg ?? (weight.value ? toKg(weight.value, unit) : undefined)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    marginBottom: 24,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardTitle: {
    color: theme.muted,
    fontSize: 16,
    fontWeight: "600",
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  goalChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  goalChipText: {
    color: GOAL_GOLD,
    fontWeight: "800",
    fontSize: 14,
  },
  logBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  logBtnText: {
    color: theme.neon,
    fontWeight: "800",
    fontSize: 15,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  currentRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    flexWrap: "wrap",
  },
  currentValue: {
    color: theme.text,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  currentUnit: {
    color: theme.muted,
    fontSize: 16,
    fontWeight: "700",
  },
  delta: {
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 4,
  },
  heroDate: {
    color: theme.muted,
    fontSize: 13,
    marginBottom: 6,
  },
  emptyCopy: {
    color: theme.muted,
    fontSize: 14,
    marginBottom: 8,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  goalLine: {
    color: GOAL_GOLD,
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
  },
  chartWrap: {
    width: "100%",
    minHeight: 168,
  },
  allLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 2,
    marginTop: 4,
    paddingTop: 4,
  },
  allLinkText: {
    color: theme.neon,
    fontWeight: "700",
    fontSize: 15,
  },
  allLinkChevron: {
    color: theme.neon,
    fontSize: 18,
    fontWeight: "700",
    marginTop: -1,
  },
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
