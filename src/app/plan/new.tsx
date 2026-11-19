import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Dumbbell,
  Minus,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { intlLocale, useLanguage } from "@/i18n";
import { useGlossary } from "@/i18n/glossary";
import { exerciseSearchText, exerciseTitle } from "@/lib/exercise-i18n";
import { muscleLabel } from "@/lib/constants-i18n";
import { AppText, Button, Chip } from "@/components/kit";
import { getExerciseImageSource } from "@/lib/exercise-image";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { MUSCLES } from "@/lib/constants";
import { createWorkoutExercise, filterExercises } from "@/lib/exercises";
import { usePremiumAccess } from "@/lib/use-premium-access";
import { PremiumPopup } from "@/components/premium-popup";
import { usePremiumStore } from "@/store/premium-store";
import { useWorkoutStore, type WeekPlan, type DayPlan } from "@/store/workout-store";
import { createId } from "@/lib/id";
import type { Exercise, MuscleId, WorkoutExercise } from "@/lib/types";

const PRESET_LABELS = ["Push", "Pull", "Legs", "Upper", "Lower", "Full Body", "Core"] as const;

interface ExerciseConfig {
  exercise: WorkoutExercise;
}

interface DayState {
  isRest: boolean;
  label: string;
  muscles: MuscleId[];
  exercises: ExerciseConfig[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Stepper component
// ─────────────────────────────────────────────────────────────────────────────
function Stepper({
  value,
  min,
  max,
  step = 1,
  onChange,
  format: fmt,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <View style={ss.stepper}>
      <Pressable
        style={[ss.stepBtn, value <= min && ss.stepBtnDisabled]}
        onPress={() => onChange(Math.max(min, value - step))}
        hitSlop={6}
      >
        <Minus size={14} color={colors.textPrimary} />
      </Pressable>
      <AppText variant="labelLarge" style={ss.stepValue}>
        {fmt ? fmt(value) : value}
      </AppText>
      <Pressable
        style={[ss.stepBtn, value >= max && ss.stepBtnDisabled]}
        onPress={() => onChange(Math.min(max, value + step))}
        hitSlop={6}
      >
        <Plus size={14} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}

/** Square exercise picture on an inset tile; a dumbbell stands in when there is no picture. */
function ExerciseThumb({ image, size }: { image: string | undefined; size: number }) {
  const source = getExerciseImageSource(image);
  return (
    <View style={[ss.thumb, { width: size, height: size }]}>
      {source ? (
        <Image source={source} style={{ width: size, height: size }} contentFit="contain" transition={150} />
      ) : (
        <Dumbbell size={size * 0.4} color={colors.textMuted} />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────
export default function NewPlanScreen() {
  const { t } = useTranslation("plan");
  const language = useLanguage();
  const g = useGlossary();
  // Index 0 = Sunday (matches dayIndex). 2023-01-01 was a Sunday.
  const dayName = (i: number) => {
    const name = new Date(2023, 0, 1 + i).toLocaleDateString(intlLocale(language), { weekday: "long" });
    return name.charAt(0).toUpperCase() + name.slice(1);
  };
  const dayShort = (i: number) =>
    new Date(2023, 0, 1 + i)
      .toLocaleDateString(intlLocale(language), { weekday: "short" })
      .replace(".", "")
      .slice(0, 3)
      .toUpperCase();
  // Labels saved from the English presets are shown in the current language.
  const displayLabel = (label: string) =>
    (PRESET_LABELS as readonly string[]).includes(label) ? t(`presets.${label}`) : label;
  const muscleList = (ids: MuscleId[]) => ids.map((m) => muscleLabel(m)).join(", ");
  const s = useWorkoutStore();
  const { planId } = useLocalSearchParams<{ planId?: string }>();
  const existingPlan = planId ? s.plans.find((p) => p.id === planId) ?? null : null;
  const isEditing = existingPlan !== null;

  // Free users are capped on plan count. The home screen already blocks the button; this covers
  // direct links. It's a snapshot taken once: saving a plan changes the count, which must not
  // re-trigger the paywall while we navigate back.
  const access = usePremiumAccess();
  const [blockedOnEntry] = useState(() => !isEditing && !access.canCreatePlan);
  const [paywallVisible, setPaywallVisible] = useState(false);

  useEffect(() => {
    if (!blockedOnEntry) return;
    // Wait for the modal route's presentation animation before showing another modal on top.
    const timer = setTimeout(() => setPaywallVisible(true), 400);
    return () => clearTimeout(timer);
  }, [blockedOnEntry]);

  const closePaywall = () => {
    setPaywallVisible(false);
    // Still on the free tier after dismissing: there's nothing to do on this screen.
    if (blockedOnEntry && !usePremiumStore.getState().isPremium) {
      setTimeout(() => router.back(), 300);
    }
  };

  const [name, setName] = useState(existingPlan?.name ?? t("defaultName"));

  const [days, setDays] = useState<DayState[]>(() => {
    if (existingPlan) {
      return Array(7)
        .fill(null)
        .map((_, i) => {
          const dp = existingPlan.days.find((d) => d.dayIndex === i);
          if (!dp || dp.isRest) return { isRest: true, label: "Rest", muscles: [], exercises: [] };
          return {
            isRest: false,
            label: dp.label,
            muscles: [],
            exercises: dp.exercises.map((e) => ({ exercise: { ...e } })),
          };
        });
    }
    return Array(7)
      .fill(null)
      .map(() => ({ isRest: true, label: "Rest", muscles: [], exercises: [] }));
  });

  // Keep plan name in sync if the plan changes externally (unlikely but safe)
  useEffect(() => {
    if (existingPlan && name === t("defaultName")) setName(existingPlan.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Single modal with internal page state ───────────────────────
  // page: "editor" = day config, "picker" = exercise picker
  const [editingDayIdx, setEditingDayIdx] = useState<number | null>(null);
  const [modalPage, setModalPage] = useState<"editor" | "picker">("editor");
  const [editIsRest, setEditIsRest] = useState(true);
  const [editLabel, setEditLabel] = useState("");
  const [editMuscles, setEditMuscles] = useState<MuscleId[]>([]);
  const [editExercises, setEditExercises] = useState<ExerciseConfig[]>([]);
  const [pickerSearch, setPickerSearch] = useState("");

  const openDayEditor = (idx: number) => {
    const d = days[idx];
    setEditIsRest(d.isRest);
    setEditLabel(d.label === "Rest" ? "" : d.label);
    setEditMuscles([...d.muscles]);
    setEditExercises(d.exercises.map((e) => ({ exercise: { ...e.exercise } })));
    setModalPage("editor");
    setEditingDayIdx(idx);
  };

  const openPicker = () => {
    setPickerSearch("");
    setModalPage("picker");
  };

  const closePicker = () => {
    setModalPage("editor");
  };

  const saveDayEdit = () => {
    if (editingDayIdx === null) return;
    const newDays = [...days];
    if (editIsRest) {
      newDays[editingDayIdx] = { isRest: true, label: "Rest", muscles: [], exercises: [] };
    } else {
      newDays[editingDayIdx] = {
        isRest: false,
        label: editLabel.trim() || t("defaultWorkout"),
        muscles: editMuscles,
        exercises: editExercises,
      };
    }
    setDays(newDays);
    setEditingDayIdx(null);
  };

  const toggleEditMuscle = (id: MuscleId) => {
    setEditMuscles((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  // ── Exercise picker logic ─────────────────────────────────────────
  const pickerPool = useMemo(() => {
    const muscles = editMuscles.length > 0 ? editMuscles : undefined;
    const query = pickerSearch.trim().toLowerCase();
    if (!query) return filterExercises({ muscles });
    // Match the English search plus the name in the current language.
    const byEnglish = new Set(filterExercises({ muscles, search: query }).map((e) => e._id));
    return filterExercises({ muscles }).filter(
      (e) => byEnglish.has(e._id) || exerciseSearchText(e._id, e.title).includes(query)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMuscles, pickerSearch, language]);

  const addExerciseFromPicker = useCallback(
    (ex: Exercise) => {
      if (editExercises.some((e) => e.exercise.exerciseId === ex._id)) return;
      const we = createWorkoutExercise(ex, s.focus);
      setEditExercises((prev) => [...prev, { exercise: we }]);
    },
    [editExercises, s.focus]
  );

  const removeExercise = (instanceId: string) => {
    setEditExercises((prev) => prev.filter((e) => e.exercise.instanceId !== instanceId));
  };

  const updateExerciseParam = (
    instanceId: string,
    key: "sets" | "reps" | "restSeconds",
    value: number
  ) => {
    setEditExercises((prev) =>
      prev.map((e) =>
        e.exercise.instanceId === instanceId
          ? { exercise: { ...e.exercise, [key]: value } }
          : e
      )
    );
  };

  // ── Save plan ─────────────────────────────────────────────────────
  const handleSavePlan = () => {
    if (!name.trim()) return Alert.alert(t("errorTitle"), t("enterName"));

    const dayPlans: DayPlan[] = days.map((d, i) => {
      if (d.isRest || d.exercises.length === 0) {
        return {
          dayIndex: i,
          label: d.isRest ? "Rest" : d.label,
          isRest: true,
          exercises: [],
        };
      }
      return {
        dayIndex: i,
        label: d.label,
        isRest: false,
        exercises: d.exercises.map((e) => e.exercise),
      };
    });

    if (isEditing && existingPlan) {
      s.updatePlan(existingPlan.id, {
        name: name.trim(),
        days: dayPlans,
      });
    } else {
      const newPlan: WeekPlan = {
        id: createId(),
        name: name.trim(),
        weekNumber: 1,
        totalWeeks: 4,
        phaseName: "Custom",
        days: dayPlans,
      };
      // The store refuses the add when a free user is at the limit; keep their work and show the paywall.
      if (!s.addPlan(newPlan)) {
        setPaywallVisible(true);
        return;
      }
    }
    router.back();
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <View style={ss.page}>
      <ScrollView contentContainerStyle={ss.scroll} showsVerticalScrollIndicator={false}>
        {/* Plan name */}
        <View style={ss.header}>
          <AppText variant="titleLarge" style={ss.screenTitle}>
            {isEditing ? t("title.edit") : t("title.new")}
          </AppText>
          <AppText variant="labelMedium" color="textSecondary" style={ss.label}>
            {t("planName")}
          </AppText>
          <TextInput
            style={ss.input}
            value={name}
            onChangeText={setName}
            placeholder={t("planNamePlaceholder")}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <AppText variant="titleSmall">{t("weeklySchedule")}</AppText>
        <AppText variant="bodyMedium" color="textSecondary" style={ss.subtitle}>
          {t("tapDay")}
        </AppText>

        <View style={ss.daysList}>
          {days.map((d, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [ss.dayCard, pressed && { opacity: 0.85 }]}
              onPress={() => openDayEditor(i)}
              accessibilityRole="button"
              accessibilityLabel={`${dayName(i)}, ${d.isRest ? t("restDay") : displayLabel(d.label)}`}
            >
              <View style={[ss.dayBadge, !d.isRest && ss.dayBadgeActive]}>
                <AppText variant="labelLarge" color={d.isRest ? "textSecondary" : "textOnAccent"}>
                  {dayShort(i)}
                </AppText>
              </View>
              <View style={ss.dayCardBody}>
                <AppText variant="labelMedium" color="textSecondary">
                  {dayName(i)}
                </AppText>
                <AppText variant="titleSmall" color={d.isRest ? "textMuted" : "textPrimary"} numberOfLines={1}>
                  {d.isRest ? t("restDay") : displayLabel(d.label)}
                </AppText>
                {!d.isRest && d.exercises.length > 0 && (
                  <View style={ss.dayTags}>
                    <View style={ss.dayTag}>
                      <AppText variant="labelMedium" color="accent">
                        {t("exerciseCount", { count: d.exercises.length })}
                      </AppText>
                    </View>
                  </View>
                )}
                {!d.isRest && d.muscles.length > 0 && d.exercises.length === 0 && (
                  <AppText variant="labelMedium" color="textSecondary" numberOfLines={1}>
                    {t("musclesNoExercises", { muscles: muscleList(d.muscles) })}
                  </AppText>
                )}
              </View>
              <ChevronRight size={20} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={ss.footer}>
        <Button
          label={isEditing ? t("saveChanges") : t("savePlan")}
          onPress={handleSavePlan}
          icon={<Save size={20} color={colors.textOnAccent} />}
        />
      </View>

      <PremiumPopup visible={paywallVisible} reason="plan_limit" onClose={closePaywall} />

      {/* ────── Single Modal (Day Editor + Exercise Picker pages) ────── */}
      <Modal visible={editingDayIdx !== null} transparent animationType="slide" onRequestClose={() => setEditingDayIdx(null)}>
        <View style={ss.modalOverlay}>
          <View style={[ss.modalContent, modalPage === "picker" && { height: "92%", maxHeight: "92%" }]}>
            <View style={ss.grabber} />

            {/* ── PAGE: Day Editor ── */}
            {modalPage === "editor" && (
              <>
                <View style={ss.modalHeader}>
                  <AppText variant="titleMedium" style={{ flex: 1 }}>
                    {editingDayIdx !== null ? dayName(editingDayIdx) : ""}
                  </AppText>
                  <Pressable onPress={() => setEditingDayIdx(null)} style={ss.roundBtn} accessibilityRole="button">
                    <X size={20} color={colors.textPrimary} />
                  </Pressable>
                </View>

                <ScrollView contentContainerStyle={ss.modalScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                  {/* Rest / Workout toggle */}
                  <View style={ss.toggleRow}>
                    <Pressable style={[ss.toggleBtn, editIsRest && ss.toggleBtnActive]} onPress={() => setEditIsRest(true)}>
                      <AppText variant="labelLarge" color={editIsRest ? "textOnAccent" : "textSecondary"}>
                        {t("restDay")}
                      </AppText>
                    </Pressable>
                    <Pressable style={[ss.toggleBtn, !editIsRest && ss.toggleBtnActive]} onPress={() => setEditIsRest(false)}>
                      <AppText variant="labelLarge" color={!editIsRest ? "textOnAccent" : "textSecondary"}>
                        {t("workoutDay")}
                      </AppText>
                    </Pressable>
                  </View>

                  {editIsRest ? (
                    <View style={ss.restHint}>
                      <Dumbbell size={28} color={colors.textMuted} />
                      <AppText variant="bodyMedium" color="textSecondary" style={{ textAlign: "center" }}>
                        {t("restDay")}
                      </AppText>
                    </View>
                  ) : (
                    <>
                      {/* Workout type label */}
                      <AppText variant="labelMedium" color="textSecondary" style={ss.label}>
                        {t("workoutType")}
                      </AppText>
                      <TextInput
                        style={[ss.input, ss.inputOnSheet]}
                        value={editLabel}
                        onChangeText={setEditLabel}
                        placeholder={t("workoutTypePlaceholder")}
                        placeholderTextColor={colors.textMuted}
                      />
                      <View style={ss.chipWrap}>
                        {PRESET_LABELS.map((p) => {
                          const presetText = t(`presets.${p}`);
                          return (
                            <Chip
                              key={p}
                              label={presetText}
                              selected={editLabel === presetText}
                              onPress={() => setEditLabel(presetText)}
                              style={editLabel === presetText ? undefined : ss.chipOnSheet}
                            />
                          );
                        })}
                      </View>

                      {/* Target muscles */}
                      <AppText variant="labelMedium" color="textSecondary" style={[ss.label, { marginTop: spacing["2xl"] }]}>
                        {t("targetMuscles")}
                      </AppText>
                      <View style={ss.chipWrap}>
                        {MUSCLES.map((m) => (
                          <Chip
                            key={m.id}
                            label={muscleLabel(m.id)}
                            dot
                            selected={editMuscles.includes(m.id)}
                            onPress={() => toggleEditMuscle(m.id)}
                            style={editMuscles.includes(m.id) ? undefined : ss.chipOnSheet}
                          />
                        ))}
                      </View>

                      {/* ── Exercises section ── */}
                      <View style={ss.exercisesSectionHeader}>
                        <AppText variant="titleSmall" style={{ flex: 1 }}>
                          {t("exercisesHeading", { n: editExercises.length })}
                        </AppText>
                        <Pressable style={ss.addExBtn} onPress={openPicker} accessibilityRole="button">
                          <Plus size={16} color={colors.textOnAccent} />
                          <AppText variant="labelLarge" color="textOnAccent">
                            {t("add")}
                          </AppText>
                        </Pressable>
                      </View>

                      {editExercises.length === 0 ? (
                        <Pressable style={ss.emptyExercises} onPress={openPicker}>
                          <View style={ss.emptyIcon}>
                            <Plus size={22} color={colors.accent} />
                          </View>
                          <AppText variant="labelLarge">{t("tapToAdd")}</AppText>
                          <AppText variant="labelMedium" color="textSecondary" style={{ textAlign: "center" }}>
                            {editMuscles.length > 0
                              ? t("filteredBy", { muscles: muscleList(editMuscles) })
                              : t("selectMusclesHint")}
                          </AppText>
                        </Pressable>
                      ) : (
                        <View style={ss.exerciseList}>
                          {editExercises.map((item, idx) => (
                            <View key={item.exercise.instanceId} style={ss.exerciseCard}>
                              <View style={ss.exCardHeader}>
                                <View>
                                  <ExerciseThumb image={item.exercise.gif} size={64} />
                                  <View style={ss.exNumBadge}>
                                    <AppText variant="caption" color="textOnAccent" style={{ fontFamily: undefined, fontWeight: "800" }}>
                                      {idx + 1}
                                    </AppText>
                                  </View>
                                </View>
                                <View style={{ flex: 1, gap: 2 }}>
                                  <AppText variant="labelLarge" numberOfLines={2}>
                                    {exerciseTitle(item.exercise.exerciseId, item.exercise.title)}
                                  </AppText>
                                  <AppText variant="labelMedium" color="accent">
                                    {g("muscle", item.exercise.mainMuscle)}
                                  </AppText>
                                </View>
                                <Pressable
                                  onPress={() => removeExercise(item.exercise.instanceId)}
                                  style={ss.exDeleteBtn}
                                  hitSlop={8}
                                  accessibilityRole="button"
                                >
                                  <Trash2 size={18} color={colors.textSecondary} />
                                </Pressable>
                              </View>

                              {/* Config row: sets / reps / rest */}
                              <View style={ss.exConfigRow}>
                                <View style={ss.exConfigItem}>
                                  <AppText variant="labelMedium" color="textSecondary" style={ss.exConfigLabel}>
                                    {t("sets")}
                                  </AppText>
                                  <Stepper
                                    value={item.exercise.sets}
                                    min={1}
                                    max={10}
                                    onChange={(v) => updateExerciseParam(item.exercise.instanceId, "sets", v)}
                                  />
                                </View>
                                <View style={ss.exConfigDivider} />
                                <View style={ss.exConfigItem}>
                                  <AppText variant="labelMedium" color="textSecondary" style={ss.exConfigLabel}>
                                    {t("reps")}
                                  </AppText>
                                  <Stepper
                                    value={item.exercise.reps}
                                    min={1}
                                    max={50}
                                    onChange={(v) => updateExerciseParam(item.exercise.instanceId, "reps", v)}
                                  />
                                </View>
                                <View style={ss.exConfigDivider} />
                                <View style={ss.exConfigItem}>
                                  <AppText variant="labelMedium" color="textSecondary" style={ss.exConfigLabel}>
                                    {t("rest")}
                                  </AppText>
                                  <Stepper
                                    value={item.exercise.restSeconds}
                                    min={15}
                                    max={300}
                                    step={15}
                                    onChange={(v) => updateExerciseParam(item.exercise.instanceId, "restSeconds", v)}
                                    format={(v) => `${v}s`}
                                  />
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </>
                  )}
                </ScrollView>

                <View style={ss.modalFooter}>
                  <Button label={t("applyToDay")} onPress={saveDayEdit} />
                </View>
              </>
            )}

            {/* ── PAGE: Exercise Picker ── */}
            {modalPage === "picker" && (
              <>
                <View style={ss.modalHeader}>
                  <Pressable onPress={closePicker} style={ss.roundBtn} accessibilityRole="button">
                    <ArrowLeft size={20} color={colors.textPrimary} />
                  </Pressable>
                  <AppText variant="titleSmall" style={ss.pickerTitle}>
                    {t("addExercise")}
                  </AppText>
                  <Pressable onPress={() => setEditingDayIdx(null)} style={ss.roundBtn} accessibilityRole="button">
                    <X size={20} color={colors.textPrimary} />
                  </Pressable>
                </View>

                {/* Search bar */}
                <View style={ss.searchBar}>
                  <Search size={18} color={colors.textMuted} />
                  <TextInput
                    style={ss.searchInput}
                    value={pickerSearch}
                    onChangeText={setPickerSearch}
                    placeholder={
                      editMuscles.length > 0
                        ? t("searchMuscleExercises", { muscles: muscleList(editMuscles.slice(0, 2)) })
                        : t("searchExercises")
                    }
                    placeholderTextColor={colors.textMuted}
                  />
                  {pickerSearch.length > 0 && (
                    <Pressable onPress={() => setPickerSearch("")} hitSlop={8}>
                      <X size={16} color={colors.textMuted} />
                    </Pressable>
                  )}
                </View>

                <AppText variant="labelMedium" color="textSecondary" style={ss.pickerCount}>
                  {t("pickerCount", { count: pickerPool.length })}
                  {editMuscles.length > 0 ? ` · ${muscleList(editMuscles)}` : ""}
                </AppText>

                <FlatList
                  data={pickerPool}
                  keyExtractor={(item) => item._id}
                  keyboardShouldPersistTaps="handled"
                  style={ss.pickerList}
                  contentContainerStyle={ss.pickerListContent}
                  initialNumToRender={10}
                  windowSize={7}
                  renderItem={({ item }) => {
                    const alreadyAdded = editExercises.some((e) => e.exercise.exerciseId === item._id);
                    return (
                      <Pressable
                        style={[ss.pickerItem, alreadyAdded && ss.pickerItemAdded]}
                        onPress={() => {
                          if (!alreadyAdded) addExerciseFromPicker(item);
                        }}
                        accessibilityRole="button"
                      >
                        <ExerciseThumb image={item.image} size={64} />
                        <View style={ss.pickerItemLeft}>
                          <AppText variant="labelLarge" numberOfLines={2}>
                            {exerciseTitle(item._id, item.title)}
                          </AppText>
                          <AppText variant="labelMedium" color="textSecondary" numberOfLines={1}>
                            {item.targets?.[0] ? g("muscle", item.targets[0]) : "–"} · {g("difficulty", item.difficulty)}
                          </AppText>
                        </View>
                        <View style={[ss.addCircle, alreadyAdded && ss.addCircleDone]}>
                          {alreadyAdded ? (
                            <Check size={16} color={colors.textOnAccent} />
                          ) : (
                            <Plus size={16} color={colors.accent} />
                          )}
                        </View>
                      </Pressable>
                    );
                  }}
                  ListEmptyComponent={
                    <View style={ss.pickerEmpty}>
                      <AppText variant="bodyMedium" color="textSecondary">
                        {t("noExercisesFound")}
                      </AppText>
                    </View>
                  }
                />

                <View style={ss.modalFooter}>
                  <Button label={t("doneAdded", { count: editExercises.length })} onPress={closePicker} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const ss = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bgApp },
  scroll: { padding: spacing.xl },

  screenTitle: { marginBottom: spacing.xl },
  header: { marginBottom: spacing["2xl"] },
  label: { textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    height: 52,
    fontSize: 16,
    fontFamily: fonts.jakartaSemiBold,
  },
  inputOnSheet: { backgroundColor: colors.bgInset },
  subtitle: { marginBottom: spacing.lg },

  daysList: { gap: spacing.md },
  dayCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    padding: spacing.md,
    paddingRight: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dayBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.bgInset,
    alignItems: "center",
    justifyContent: "center",
  },
  dayBadgeActive: { backgroundColor: colors.accent },
  dayCardBody: { flex: 1, gap: 2 },
  dayTags: { flexDirection: "row", paddingTop: spacing.xs },
  dayTag: {
    height: 24,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.bgInset,
    justifyContent: "center",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
    backgroundColor: colors.bgApp,
  },

  /* ── Modal shared ── */
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: colors.bgSurface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "90%",
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    opacity: 0.5,
    marginTop: spacing.md,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.bgInset,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerTitle: { flex: 1, textAlign: "center" },
  modalScroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  modalFooter: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing["3xl"],
  },

  /* ── Day editor ── */
  toggleRow: {
    flexDirection: "row",
    backgroundColor: colors.bgInset,
    borderRadius: radius.full,
    padding: spacing.xs,
    marginBottom: spacing.xl,
  },
  toggleBtn: { flex: 1, height: 44, alignItems: "center", justifyContent: "center", borderRadius: radius.full },
  toggleBtnActive: { backgroundColor: colors.accent },
  restHint: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing["3xl"],
    borderRadius: radius.lg,
    backgroundColor: colors.bgInset,
  },

  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.md },
  // Chips default to the surface colour, which is the sheet colour here; use the inset tone instead.
  chipOnSheet: { backgroundColor: colors.bgInset },

  /* ── Exercises section ── */
  exercisesSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing["2xl"],
    marginBottom: spacing.md,
  },
  addExBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    height: 36,
    borderRadius: radius.full,
  },
  emptyExercises: {
    backgroundColor: colors.bgInset,
    borderRadius: radius.lg,
    alignItems: "center",
    paddingVertical: spacing["2xl"],
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
  },

  exerciseList: { gap: spacing.md },
  exerciseCard: {
    backgroundColor: colors.bgInset,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  exCardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  exNumBadge: {
    position: "absolute",
    top: -4,
    left: -4,
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  exDeleteBtn: { padding: spacing.xs },
  thumb: {
    borderRadius: radius.md,
    backgroundColor: colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  exConfigRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  exConfigItem: { flex: 1, alignItems: "center", gap: spacing.sm },
  exConfigLabel: { textTransform: "uppercase", letterSpacing: 0.5 },
  exConfigDivider: { width: 1, height: 40, backgroundColor: colors.bgInset },

  /* ── Stepper ── */
  stepper: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.bgInset,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnDisabled: { opacity: 0.35 },
  stepValue: { minWidth: 30, textAlign: "center" },

  /* ── Exercise picker ── */
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.bgInset,
    borderRadius: radius.full,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    height: 48,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: fonts.jakartaRegular,
    padding: 0,
  },
  pickerCount: { marginHorizontal: spacing.xl, marginBottom: spacing.sm },
  pickerList: { flex: 1 },
  pickerListContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md, gap: spacing.sm },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.bgInset,
    borderRadius: radius.lg,
    padding: spacing.sm,
    paddingRight: spacing.lg,
  },
  pickerItemAdded: { opacity: 0.6 },
  pickerItemLeft: { flex: 1, gap: 2 },
  addCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  addCircleDone: { backgroundColor: colors.accent },
  pickerEmpty: { alignItems: "center", paddingVertical: spacing["3xl"] },
});
