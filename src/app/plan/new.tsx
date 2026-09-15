import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Check, ChevronRight, Save, X } from "lucide-react-native";
import { theme } from "@/lib/theme";
import { MUSCLES } from "@/lib/constants";
import { generateWorkout } from "@/lib/exercises";
import { useWorkoutStore, type WeekPlan, type DayPlan } from "@/store/workout-store";
import { createId } from "@/lib/id";
import type { GeneratorOptions, MuscleId } from "@/lib/types";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PRESET_LABELS = ["Push", "Pull", "Legs", "Upper", "Lower", "Full Body", "Core"];

interface DayState {
  isRest: boolean;
  label: string;
  muscles: MuscleId[];
}

export default function NewPlanScreen() {
  const s = useWorkoutStore();
  const [name, setName] = useState("My Custom Plan");
  
  const [days, setDays] = useState<DayState[]>(
    Array(7).fill(null).map(() => ({
      isRest: true,
      label: "Rest",
      muscles: [],
    }))
  );

  const [editingDayIdx, setEditingDayIdx] = useState<number | null>(null);
  
  // Temporary state for the day editor modal
  const [editIsRest, setEditIsRest] = useState(true);
  const [editLabel, setEditLabel] = useState("");
  const [editMuscles, setEditMuscles] = useState<MuscleId[]>([]);

  const openDayEditor = (idx: number) => {
    const d = days[idx];
    setEditIsRest(d.isRest);
    setEditLabel(d.label === "Rest" ? "" : d.label);
    setEditMuscles([...d.muscles]);
    setEditingDayIdx(idx);
  };

  const saveDayEdit = () => {
    if (editingDayIdx === null) return;
    const newDays = [...days];
    if (editIsRest) {
      newDays[editingDayIdx] = { isRest: true, label: "Rest", muscles: [] };
    } else {
      newDays[editingDayIdx] = {
        isRest: false,
        label: editLabel.trim() || "Workout",
        muscles: editMuscles,
      };
    }
    setDays(newDays);
    setEditingDayIdx(null);
  };

  const toggleEditMuscle = (id: MuscleId) => {
    if (editMuscles.includes(id)) {
      setEditMuscles(editMuscles.filter(m => m !== id));
    } else {
      setEditMuscles([...editMuscles, id]);
    }
  };

  const handleSavePlan = () => {
    if (!name.trim()) return Alert.alert("Error", "Please enter a plan name.");

    // Generate exercises for each workout day
    const dayPlans: DayPlan[] = days.map((d, i) => {
      if (d.isRest || d.muscles.length === 0) {
        return {
          dayIndex: i,
          label: d.isRest ? "Rest" : d.label,
          isRest: true,
          exercises: [],
        };
      }

      const exercises = generateWorkout(s.equipment, d.muscles, {
        exerciseCount: s.exerciseCount,
        focus: s.focus,
        difficulties: s.difficulties,
      } as GeneratorOptions);

      return {
        dayIndex: i,
        label: d.label,
        isRest: false,
        exercises,
      };
    });

    const newPlan: WeekPlan = {
      id: createId(),
      name: name.trim(),
      weekNumber: 1,
      totalWeeks: 4,
      phaseName: "Custom",
      days: dayPlans,
    };

    s.addPlan(newPlan);
    router.back();
  };

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.label}>Plan Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="E.g., Summer Shred"
            placeholderTextColor={theme.muted}
          />
        </View>

        <Text style={styles.sectionTitle}>Weekly Schedule</Text>
        <Text style={styles.subtitle}>Tap a day to configure its workout.</Text>

        <View style={styles.daysList}>
          {days.map((d, i) => (
            <Pressable
              key={i}
              style={styles.dayCard}
              onPress={() => openDayEditor(i)}
            >
              <View style={styles.dayCardLeft}>
                <Text style={styles.dayName}>{DAY_NAMES[i]}</Text>
                <Text style={[styles.dayLabel, d.isRest && styles.dayLabelRest]}>
                  {d.isRest ? "Rest Day" : d.label}
                </Text>
                {!d.isRest && d.muscles.length > 0 && (
                  <Text style={styles.dayMuscles} numberOfLines={1}>
                    {d.muscles.join(", ")}
                  </Text>
                )}
              </View>
              <ChevronRight size={20} color={theme.muted} />
            </Pressable>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.saveBtn} onPress={handleSavePlan}>
          <Save size={20} color={theme.background} />
          <Text style={styles.saveBtnText}>Save Plan</Text>
        </Pressable>
      </View>

      {/* --- Day Editor Modal --- */}
      <Modal visible={editingDayIdx !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingDayIdx !== null ? DAY_NAMES[editingDayIdx] : ""}
              </Text>
              <Pressable onPress={() => setEditingDayIdx(null)}>
                <X size={24} color={theme.muted} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.toggleRow}>
                <Pressable
                  style={[styles.toggleBtn, editIsRest && styles.toggleBtnActive]}
                  onPress={() => setEditIsRest(true)}
                >
                  <Text style={[styles.toggleText, editIsRest && styles.toggleTextActive]}>Rest Day</Text>
                </Pressable>
                <Pressable
                  style={[styles.toggleBtn, !editIsRest && styles.toggleBtnActive]}
                  onPress={() => setEditIsRest(false)}
                >
                  <Text style={[styles.toggleText, !editIsRest && styles.toggleTextActive]}>Workout Day</Text>
                </Pressable>
              </View>

              {!editIsRest && (
                <>
                  <Text style={styles.label}>Workout Type</Text>
                  <TextInput
                    style={styles.input}
                    value={editLabel}
                    onChangeText={setEditLabel}
                    placeholder="E.g., Push, Upper, Legs..."
                    placeholderTextColor={theme.muted}
                  />

                  <View style={styles.presetsRow}>
                    {PRESET_LABELS.map((p) => (
                      <Pressable
                        key={p}
                        style={styles.presetChip}
                        onPress={() => setEditLabel(p)}
                      >
                        <Text style={styles.presetChipText}>{p}</Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={[styles.label, { marginTop: 16 }]}>Target Muscles</Text>
                  <View style={styles.musclesGrid}>
                    {MUSCLES.map((m) => {
                      const active = editMuscles.includes(m.id);
                      return (
                        <Pressable
                          key={m.id}
                          style={[styles.muscleChip, active && styles.muscleChipActive]}
                          onPress={() => toggleEditMuscle(m.id)}
                        >
                          {active && <Check size={14} color={theme.background} style={{ marginRight: 4 }} />}
                          <Text style={[styles.muscleText, active && styles.muscleTextActive]}>
                            {m.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable style={styles.modalSaveBtn} onPress={saveDayEdit}>
                <Text style={styles.modalSaveText}>Apply to Day</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scroll: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  label: {
    color: theme.muted,
    fontSize: 13,
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
    padding: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 4,
  },
  subtitle: {
    color: theme.muted,
    fontSize: 14,
    marginBottom: 16,
  },
  daysList: {
    gap: 12,
  },
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
  dayCardLeft: {
    flex: 1,
  },
  dayName: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  dayLabel: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "800",
  },
  dayLabelRest: {
    color: theme.muted,
  },
  dayMuscles: {
    color: theme.neon,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
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
  saveBtnText: {
    color: theme.background,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },

  /* -- Modal -- */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "800",
  },
  modalScroll: {
    padding: 20,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: theme.border,
  },
  toggleText: {
    color: theme.muted,
    fontWeight: "700",
    fontSize: 15,
  },
  toggleTextActive: {
    color: theme.text,
  },
  presetsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  presetChip: {
    backgroundColor: theme.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  presetChipText: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  musclesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
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
  muscleChipActive: {
    backgroundColor: theme.neon,
    borderColor: theme.neon,
  },
  muscleText: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  muscleTextActive: {
    color: theme.background,
  },
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
  modalSaveText: {
    color: theme.background,
    fontSize: 16,
    fontWeight: "900",
  },
});
