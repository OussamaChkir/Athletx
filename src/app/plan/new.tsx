import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
import { theme } from "@/lib/theme";
import { MUSCLES } from "@/lib/constants";
import { createWorkoutExercise, filterExercises } from "@/lib/exercises";
import { useWorkoutStore, type WeekPlan, type DayPlan } from "@/store/workout-store";
import { createId } from "@/lib/id";
import type { Exercise, MuscleId, WorkoutExercise } from "@/lib/types";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PRESET_LABELS = ["Push", "Pull", "Legs", "Upper", "Lower", "Full Body", "Core"];

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
      >
        <Minus size={14} color={value <= min ? theme.muted : theme.text} />
      </Pressable>
      <Text style={ss.stepValue}>{fmt ? fmt(value) : value}</Text>
      <Pressable
        style={[ss.stepBtn, value >= max && ss.stepBtnDisabled]}
        onPress={() => onChange(Math.min(max, value + step))}
      >
        <Plus size={14} color={value >= max ? theme.muted : theme.text} />
      </Pressable>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────
export default function NewPlanScreen() {
  const s = useWorkoutStore();
  const { planId } = useLocalSearchParams<{ planId?: string }>();
  const existingPlan = planId ? s.plans.find((p) => p.id === planId) ?? null : null;
  const isEditing = existingPlan !== null;

  const [name, setName] = useState(existingPlan?.name ?? "My Custom Plan");

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
    if (existingPlan && name === "My Custom Plan") setName(existingPlan.name);
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
        label: editLabel.trim() || "Workout",
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
    return filterExercises({
      muscles: editMuscles.length > 0 ? editMuscles : undefined,
      search: pickerSearch.trim() || undefined,
    });
  }, [editMuscles, pickerSearch]);

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
    if (!name.trim()) return Alert.alert("Error", "Please enter a plan name.");

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
      s.addPlan(newPlan);
    }
    router.back();
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <View style={ss.page}>
      <ScrollView contentContainerStyle={ss.scroll}>
        {/* Plan name */}
        <View style={ss.header}>
          <Text style={ss.screenTitle}>{isEditing ? "Edit Plan" : "New Plan"}</Text>
          <Text style={ss.label}>Plan Name</Text>
          <TextInput
            style={ss.input}
            value={name}
            onChangeText={setName}
            placeholder="E.g., Summer Shred"
            placeholderTextColor={theme.muted}
          />
        </View>

        <Text style={ss.sectionTitle}>Weekly Schedule</Text>
        <Text style={ss.subtitle}>Tap a day to configure its workout.</Text>

        <View style={ss.daysList}>
          {days.map((d, i) => (
            <Pressable key={i} style={ss.dayCard} onPress={() => openDayEditor(i)}>
              <View style={ss.dayCardLeft}>
                <Text style={ss.dayName}>{DAY_NAMES[i]}</Text>
                <Text style={[ss.dayLabel, d.isRest && ss.dayLabelRest]}>
                  {d.isRest ? "Rest Day" : d.label}
                </Text>
                {!d.isRest && d.exercises.length > 0 && (
                  <Text style={ss.dayMeta}>
                    {d.exercises.length} exercise{d.exercises.length !== 1 ? "s" : ""}
                  </Text>
                )}
                {!d.isRest && d.muscles.length > 0 && d.exercises.length === 0 && (
                  <Text style={ss.dayMeta}>{d.muscles.join(", ")} · no exercises yet</Text>
                )}
              </View>
              <ChevronRight size={20} color={theme.muted} />
            </Pressable>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={ss.footer}>
          <Pressable style={ss.saveBtn} onPress={handleSavePlan}>
            <Save size={20} color={theme.background} />
            <Text style={ss.saveBtnText}>{isEditing ? "Save Changes" : "Save Plan"}</Text>
          </Pressable>
        </View>

      {/* ────── Single Modal (Day Editor + Exercise Picker pages) ────── */}
      <Modal visible={editingDayIdx !== null} transparent animationType="slide">
        <View style={ss.modalOverlay}>
          <View style={[ss.modalContent, modalPage === "picker" && { height: "92%", maxHeight: "92%" }]}>

            {/* ── PAGE: Day Editor ── */}
            {modalPage === "editor" && (
              <>
                <View style={ss.modalHeader}>
                  <Text style={ss.modalTitle}>
                    {editingDayIdx !== null ? DAY_NAMES[editingDayIdx] : ""}
                  </Text>
                  <Pressable onPress={() => setEditingDayIdx(null)}>
                    <X size={24} color={theme.muted} />
                  </Pressable>
                </View>

            <ScrollView contentContainerStyle={ss.modalScroll} keyboardShouldPersistTaps="handled">
              {/* Rest / Workout toggle */}
              <View style={ss.toggleRow}>
                <Pressable
                  style={[ss.toggleBtn, editIsRest && ss.toggleBtnActive]}
                  onPress={() => setEditIsRest(true)}
                >
                  <Text style={[ss.toggleText, editIsRest && ss.toggleTextActive]}>Rest Day</Text>
                </Pressable>
                <Pressable
                  style={[ss.toggleBtn, !editIsRest && ss.toggleBtnActive]}
                  onPress={() => setEditIsRest(false)}
                >
                  <Text style={[ss.toggleText, !editIsRest && ss.toggleTextActive]}>
                    Workout Day
                  </Text>
                </Pressable>
              </View>

              {!editIsRest && (
                <>
                  {/* Workout type label */}
                  <Text style={ss.label}>Workout Type</Text>
                  <TextInput
                    style={ss.input}
                    value={editLabel}
                    onChangeText={setEditLabel}
                    placeholder="E.g., Push, Upper, Legs..."
                    placeholderTextColor={theme.muted}
                  />
                  <View style={ss.presetsRow}>
                    {PRESET_LABELS.map((p) => (
                      <Pressable
                        key={p}
                        style={[ss.presetChip, editLabel === p && ss.presetChipActive]}
                        onPress={() => setEditLabel(p)}
                      >
                        <Text style={[ss.presetChipText, editLabel === p && ss.presetChipTextActive]}>
                          {p}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Target muscles */}
                  <Text style={[ss.label, { marginTop: 20 }]}>Target Muscles</Text>
                  <View style={ss.musclesGrid}>
                    {MUSCLES.map((m) => {
                      const active = editMuscles.includes(m.id);
                      return (
                        <Pressable
                          key={m.id}
                          style={[ss.muscleChip, active && ss.muscleChipActive]}
                          onPress={() => toggleEditMuscle(m.id)}
                        >
                          {active && (
                            <Check size={14} color={theme.background} style={{ marginRight: 4 }} />
                          )}
                          <Text style={[ss.muscleText, active && ss.muscleTextActive]}>
                            {m.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* ── Exercises section ── */}
                  <View style={ss.exercisesSectionHeader}>
                    <Text style={[ss.label, { marginTop: 0, marginBottom: 0, flex: 1 }]}>
                      Exercises ({editExercises.length})
                    </Text>
                    <Pressable
                      style={ss.addExBtn}
                      onPress={openPicker}
                    >
                      <Plus size={14} color={theme.background} />
                      <Text style={ss.addExBtnText}>Add</Text>
                    </Pressable>
                  </View>

                  {editExercises.length === 0 ? (
                    <Pressable
                      style={ss.emptyExercises}
                      onPress={openPicker}
                    >
                      <Dumbbell size={28} color={theme.muted} />
                      <Text style={ss.emptyExText}>Tap to add exercises</Text>
                      <Text style={ss.emptyExSub}>
                        {editMuscles.length > 0
                          ? `Filtered by: ${editMuscles.join(", ")}`
                          : "Select muscles above to filter exercises"}
                      </Text>
                    </Pressable>
                  ) : (
                    <View style={ss.exerciseList}>
                      {editExercises.map((item, idx) => (
                        <View key={item.exercise.instanceId} style={ss.exerciseCard}>
                          {/* Header row */}
                          <View style={ss.exCardHeader}>
                            <View style={ss.exNumBadge}>
                              <Text style={ss.exNumText}>{idx + 1}</Text>
                            </View>
                            <Text style={ss.exTitle} numberOfLines={2}>
                              {item.exercise.title}
                            </Text>
                            <Pressable
                              onPress={() => removeExercise(item.exercise.instanceId)}
                              style={ss.exDeleteBtn}
                            >
                              <Trash2 size={16} color={theme.muted} />
                            </Pressable>
                          </View>

                          {/* Muscle tag */}
                          <Text style={ss.exMuscleTag}>{item.exercise.mainMuscle}</Text>

                          {/* Config row: sets / reps / rest */}
                          <View style={ss.exConfigRow}>
                            <View style={ss.exConfigItem}>
                              <Text style={ss.exConfigLabel}>Sets</Text>
                              <Stepper
                                value={item.exercise.sets}
                                min={1}
                                max={10}
                                onChange={(v) =>
                                  updateExerciseParam(item.exercise.instanceId, "sets", v)
                                }
                              />
                            </View>

                            <View style={ss.exConfigDivider} />

                            <View style={ss.exConfigItem}>
                              <Text style={ss.exConfigLabel}>Reps</Text>
                              <Stepper
                                value={item.exercise.reps}
                                min={1}
                                max={50}
                                onChange={(v) =>
                                  updateExerciseParam(item.exercise.instanceId, "reps", v)
                                }
                              />
                            </View>

                            <View style={ss.exConfigDivider} />

                            <View style={ss.exConfigItem}>
                              <Text style={ss.exConfigLabel}>Rest</Text>
                              <Stepper
                                value={item.exercise.restSeconds}
                                min={15}
                                max={300}
                                step={15}
                                onChange={(v) =>
                                  updateExerciseParam(item.exercise.instanceId, "restSeconds", v)
                                }
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
                  <Pressable style={ss.modalSaveBtn} onPress={saveDayEdit}>
                    <Text style={ss.modalSaveText}>Apply to Day</Text>
                  </Pressable>
                </View>
              </>
            )}

            {/* ── PAGE: Exercise Picker ── */}
            {modalPage === "picker" && (
              <>
                <View style={ss.modalHeader}>
                  <Pressable onPress={closePicker} style={ss.backBtn}>
                    <ArrowLeft size={20} color={theme.text} />
                  </Pressable>
                  <Text style={ss.modalTitle}>Add Exercise</Text>
                  <Pressable onPress={() => setEditingDayIdx(null)}>
                    <X size={24} color={theme.muted} />
                  </Pressable>
                </View>

                {/* Search bar */}
                <View style={ss.searchBar}>
                  <Search size={16} color={theme.muted} style={{ marginRight: 8 }} />
                  <TextInput
                    style={ss.searchInput}
                    value={pickerSearch}
                    onChangeText={setPickerSearch}
                    placeholder={
                      editMuscles.length > 0
                        ? `Search ${editMuscles.slice(0, 2).join(", ")} exercises…`
                        : "Search exercises…"
                    }
                    placeholderTextColor={theme.muted}
                  />
                  {pickerSearch.length > 0 && (
                    <Pressable onPress={() => setPickerSearch("")}>
                      <X size={16} color={theme.muted} />
                    </Pressable>
                  )}
                </View>

                <Text style={ss.pickerCount}>
                  {pickerPool.length} exercise{pickerPool.length !== 1 ? "s" : ""}
                  {editMuscles.length > 0 ? ` · ${editMuscles.join(", ")}` : ""}
                </Text>

                <FlatList
                  data={pickerPool}
                  keyExtractor={(item) => item._id}
                  keyboardShouldPersistTaps="handled"
                  style={ss.pickerList}
                  renderItem={({ item }) => {
                    const alreadyAdded = editExercises.some(
                      (e) => e.exercise.exerciseId === item._id
                    );
                    return (
                      <Pressable
                        style={[ss.pickerItem, alreadyAdded && ss.pickerItemAdded]}
                        onPress={() => {
                          if (!alreadyAdded) addExerciseFromPicker(item);
                        }}
                      >
                        <View style={ss.pickerItemLeft}>
                          <Text
                            style={[ss.pickerItemTitle, alreadyAdded && ss.pickerItemTitleAdded]}
                          >
                            {item.title}
                          </Text>
                          <Text style={ss.pickerItemMeta}>
                            {item.targets?.[0] ?? "–"} · {item.difficulty}
                          </Text>
                        </View>
                        {alreadyAdded ? (
                          <Check size={18} color={theme.neon} />
                        ) : (
                          <Plus size={18} color={theme.muted} />
                        )}
                      </Pressable>
                    );
                  }}
                  ListEmptyComponent={
                    <View style={ss.pickerEmpty}>
                      <Text style={ss.pickerEmptyText}>No exercises found</Text>
                    </View>
                  }
                />

                <View style={ss.modalFooter}>
                  <Pressable style={ss.modalSaveBtn} onPress={closePicker}>
                    <Text style={ss.modalSaveText}>
                      Done · {editExercises.length} added
                    </Text>
                  </Pressable>
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
  page: { flex: 1, backgroundColor: theme.background },
  scroll: { padding: 20 },

  screenTitle: {
    color: theme.text,
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 16,
  },
  header: { marginBottom: 24 },
  label: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    color: theme.text,
    padding: 14,
    fontSize: 16,
    fontWeight: "600",
  },

  sectionTitle: { color: theme.text, fontSize: 20, fontWeight: "900", marginBottom: 4 },
  subtitle: { color: theme.muted, fontSize: 14, marginBottom: 16 },

  daysList: { gap: 12 },
  dayCard: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayCardLeft: { flex: 1 },
  dayName: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  dayLabel: { color: theme.text, fontSize: 18, fontWeight: "800" },
  dayLabelRest: { color: theme.muted },
  dayMeta: { color: theme.neon, fontSize: 12, fontWeight: "600", marginTop: 4 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  saveBtn: {
    backgroundColor: theme.neon,
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveBtnText: { color: theme.background, fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },

  /* ── Modal shared ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: { color: theme.text, fontSize: 18, fontWeight: "800" },
  modalScroll: { padding: 20, paddingBottom: 8 },
  modalFooter: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  modalSaveBtn: {
    backgroundColor: theme.neon,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveText: { color: theme.background, fontSize: 16, fontWeight: "900" },
  backBtn: { padding: 4, marginRight: 4 },

  /* ── Day editor ── */
  toggleRow: {
    flexDirection: "row",
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 8 },
  toggleBtnActive: { backgroundColor: theme.border },
  toggleText: { color: theme.muted, fontWeight: "700", fontSize: 15 },
  toggleTextActive: { color: theme.text },

  presetsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  presetChip: {
    backgroundColor: theme.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  presetChipActive: { backgroundColor: theme.neon, borderColor: theme.neon },
  presetChipText: { color: theme.muted, fontSize: 13, fontWeight: "600" },
  presetChipTextActive: { color: theme.background },

  musclesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  muscleChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
  },
  muscleChipActive: { backgroundColor: theme.neon, borderColor: theme.neon },
  muscleText: { color: theme.muted, fontSize: 13, fontWeight: "700" },
  muscleTextActive: { color: theme.background },

  /* ── Exercises section ── */
  exercisesSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  addExBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.neon,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addExBtnText: { color: theme.background, fontSize: 13, fontWeight: "800" },

  emptyExercises: {
    borderWidth: 1,
    borderColor: theme.border,
    borderStyle: "dashed",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyExText: { color: theme.muted, fontSize: 15, fontWeight: "700" },
  emptyExSub: { color: theme.muted, fontSize: 12, textAlign: "center", opacity: 0.7 },

  exerciseList: { gap: 12 },
  exerciseCard: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
  },
  exCardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 4 },
  exNumBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.neon,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  exNumText: { color: theme.background, fontSize: 11, fontWeight: "900" },
  exTitle: { flex: 1, color: theme.text, fontSize: 14, fontWeight: "700", lineHeight: 20 },
  exDeleteBtn: { padding: 4 },
  exMuscleTag: { color: theme.neon, fontSize: 11, fontWeight: "700", marginBottom: 12 },

  exConfigRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.background,
    borderRadius: 10,
    padding: 10,
  },
  exConfigItem: { flex: 1, alignItems: "center", gap: 6 },
  exConfigLabel: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  exConfigDivider: { width: 1, height: 36, backgroundColor: theme.border },

  /* ── Stepper ── */
  stepper: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnDisabled: { opacity: 0.35 },
  stepValue: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "800",
    minWidth: 30,
    textAlign: "center",
  },

  /* ── Exercise picker ── */
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, color: theme.text, fontSize: 15, fontWeight: "500" },
  pickerCount: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "600",
    marginHorizontal: 20,
    marginBottom: 8,
  },
  pickerList: { flex: 1 },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  pickerItemAdded: { opacity: 0.55 },
  pickerItemLeft: { flex: 1, marginRight: 12 },
  pickerItemTitle: { color: theme.text, fontSize: 15, fontWeight: "700", marginBottom: 3 },
  pickerItemTitleAdded: { color: theme.muted },
  pickerItemMeta: { color: theme.muted, fontSize: 12 },
  pickerEmpty: { alignItems: "center", paddingVertical: 40 },
  pickerEmptyText: { color: theme.muted, fontSize: 15 },
});
