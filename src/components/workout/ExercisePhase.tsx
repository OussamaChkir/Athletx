import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Minus, Plus } from "lucide-react-native";
import { AppText, Button } from "@/components/kit";
import { ExerciseCover } from "@/components/workout/shared";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { convertWeight, fromKg, roundWeight, toKg, type BodyWeightUnit } from "@/lib/weight";
import type { WorkoutExercise } from "@/lib/types";

const WEIGHT_STEP: Record<BodyWeightUnit, number> = { kg: 2.5, lb: 5 };

const showNumber = (n: number) => String(roundWeight(n, 1));

function ValueCard({
  label,
  value,
  onChangeText,
  onMinus,
  onPlus,
  keyboardType,
  placeholder,
  right,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  onMinus: () => void;
  onPlus: () => void;
  keyboardType: "number-pad" | "decimal-pad";
  placeholder: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.valueCard}>
      <View style={styles.valueHead}>
        <AppText variant="bodyMedium" color="textSecondary">
          {label}
        </AppText>
        {right}
      </View>
      <TextInput
        style={styles.valueInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectTextOnFocus
        accessibilityLabel={label}
      />
      <View style={styles.stepRow}>
        <Pressable style={styles.stepButton} onPress={onMinus} accessibilityRole="button" accessibilityLabel={`Decrease ${label}`}>
          <Minus size={18} color={colors.textPrimary} />
        </Pressable>
        <Pressable style={styles.stepButton} onPress={onPlus} accessibilityRole="button" accessibilityLabel={`Increase ${label}`}>
          <Plus size={18} color={colors.accent} />
        </Pressable>
      </View>
    </View>
  );
}

type Props = {
  exercise: WorkoutExercise;
  index: number;
  total: number;
  /** The set being logged, starting at 1. */
  set: number;
  unit: BodyWeightUnit;
  onToggleUnit: () => void;
  /** Weight from the previous set of this exercise today, or from the last workout, in kg. */
  startWeightKg?: number;
  lastTime?: { weight?: number; reps: number } | null;
  onComplete: (reps: number, weightKg: number | undefined) => void;
};

/** Live Workout: log reps and weight for the current set. Remounted for every set so inputs reset. */
export function ExercisePhase({ exercise, index, total, set, unit, onToggleUnit, startWeightKg, lastTime, onComplete }: Props) {
  const [reps, setReps] = useState(String(exercise.reps));
  const [weight, setWeight] = useState(startWeightKg != null ? showNumber(fromKg(startWeightKg, unit)) : "");

  const step = WEIGHT_STEP[unit];
  const bump = (text: string, delta: number, decimals: number) => {
    const current = parseFloat(text);
    const next = Math.max(0, (Number.isNaN(current) ? 0 : current) + delta);
    return String(roundWeight(next, decimals));
  };

  const submit = () => {
    const rawWeight = parseFloat(weight);
    const weightKg = Number.isNaN(rawWeight) || rawWeight <= 0 ? undefined : roundWeight(toKg(rawWeight, unit), 2);
    onComplete(Number.parseInt(reps, 10) || exercise.reps, weightKg);
  };

  const switchUnit = () => {
    const parsed = parseFloat(weight);
    const other: BodyWeightUnit = unit === "kg" ? "lb" : "kg";
    if (!Number.isNaN(parsed)) setWeight(showNumber(convertWeight(parsed, unit, other)));
    onToggleUnit();
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <ExerciseCover
          image={exercise.gif}
          height={210}
          badgeTone="inset"
          badge={
            <AppText variant="labelMedium">
              Exercise {index + 1} / {total}
            </AppText>
          }
        />

        <View style={{ gap: spacing.sm }}>
          <AppText variant="titleLarge">{exercise.title}</AppText>
          <View style={styles.metaRow}>
            <View style={styles.dot} />
            <AppText variant="bodyMedium" color="textSecondary">
              {exercise.mainMuscle}
              {exercise.equipment[0] ? `  ·  ${exercise.equipment[0]}` : ""}
            </AppText>
          </View>
        </View>

        <View style={styles.setRow}>
          <AppText variant="labelLarge" color="accent">
            Set {set} of {exercise.sets}
          </AppText>
          <View style={styles.segments}>
            {Array.from({ length: exercise.sets }, (_, i) => (
              <View key={i} style={[styles.segment, { backgroundColor: i < set ? colors.accent : colors.bgSurface }]} />
            ))}
          </View>
        </View>

        <View style={styles.cards}>
          <ValueCard
            label="Reps"
            value={reps}
            onChangeText={setReps}
            onMinus={() => setReps(bump(reps, -1, 0))}
            onPlus={() => setReps(bump(reps, 1, 0))}
            keyboardType="number-pad"
            placeholder={String(exercise.reps)}
          />
          <ValueCard
            label="Weight"
            value={weight}
            onChangeText={setWeight}
            onMinus={() => setWeight(bump(weight, -step, 1))}
            onPlus={() => setWeight(bump(weight, step, 1))}
            keyboardType="decimal-pad"
            placeholder="—"
            right={
              <Pressable style={styles.unitChip} onPress={switchUnit} hitSlop={8} accessibilityRole="button" accessibilityLabel="Switch weight unit">
                <AppText variant="labelMedium" color="accent">
                  {unit}
                </AppText>
              </Pressable>
            }
          />
        </View>

        {lastTime ? (
          <AppText variant="bodyMedium" color="textSecondary" style={{ textAlign: "center" }}>
            Last time: {lastTime.weight ? `${showNumber(fromKg(lastTime.weight, unit))} ${unit} × ` : ""}
            {lastTime.reps}
          </AppText>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Complete set" onPress={submit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing["2xl"], paddingTop: spacing.sm, paddingBottom: spacing.xl, gap: spacing.xl },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  setRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  segments: { flexDirection: "row", gap: spacing.xs },
  segment: { width: 28, height: 6, borderRadius: 3 },
  cards: { flexDirection: "row", gap: spacing.md },
  valueCard: { flex: 1, backgroundColor: colors.bgSurface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  valueHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 24 },
  valueInput: {
    fontFamily: fonts.jostMedium,
    fontSize: 36,
    lineHeight: 44,
    color: colors.textPrimary,
    textAlign: "center",
    padding: 0,
  },
  stepRow: { flexDirection: "row", gap: spacing.sm },
  stepButton: {
    flex: 1,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.bgInset,
    alignItems: "center",
    justifyContent: "center",
  },
  unitChip: { height: 24, paddingHorizontal: spacing.md, borderRadius: radius.full, backgroundColor: colors.bgInset, justifyContent: "center" },
  footer: { paddingHorizontal: spacing["2xl"], paddingBottom: spacing.lg, paddingTop: spacing.sm },
});
