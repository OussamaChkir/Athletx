import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { router } from "expo-router";
import {
  Calendar,
  ChevronDown,
  Clock,
  Dumbbell,
  Edit3,
  Flame,
  Info,
  Play,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Zap,
} from "lucide-react-native";
import { EQUIPMENT_LIST, FOCUS_PRESETS, MUSCLES, MUSCLE_COLORS } from "@/lib/constants";
import { createWorkoutExercise, filterExercises, getExerciseById } from "@/lib/exercises";
import { theme } from "@/lib/theme";
import type { WorkoutExercise, WorkoutFocus } from "@/lib/types";
import { useWorkoutStore, type DayPlan } from "@/store/workout-store";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getWeekDates(): { day: string; date: number; dayIndex: number; isToday: boolean }[] {
  const now = new Date();
  const todayDOW = now.getDay();
  const result = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - todayDOW + i);
    result.push({
      day: DAY_NAMES[i],
      date: d.getDate(),
      dayIndex: i,
      isToday: i === todayDOW,
    });
  }
  return result;
}

/* ===== HOMEPAGE ===== */
const card = {
  backgroundColor: theme.surface,
  borderColor: theme.border,
  borderWidth: 1,
  borderRadius: 16,
} as const;

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress(): void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.neon]}>{label}</Text>
    </Pressable>
  );
}

export function TrainScreen() {
  const s = useWorkoutStore();
  const weekDates = useMemo(() => getWeekDates(), []);
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDay());

  const weekPlan = s.weekPlan;
  const todayPlan: DayPlan | null = weekPlan?.days[selectedDay] ?? null;
  const exercises = todayPlan?.exercises ?? s.currentWorkout;
  const workoutLabel = todayPlan?.label ?? "Custom";
  const isRest = todayPlan?.isRest ?? false;

  const estimatedMinutes = Math.round(
    exercises.reduce((t, e) => t + e.sets * (0.75 + e.restSeconds / 60), 0)
  );
  const estimatedCal = Math.round(estimatedMinutes * 4.5);

  const handleDayPress = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    if (weekPlan) {
      const day = weekPlan.days[dayIndex];
      if (day && !day.isRest) {
        s.loadDayWorkout(dayIndex);
      }
    }
  };

  const handleStartWorkout = () => {
    if (!exercises.length) return;
    s.saveCurrentWorkout();
    s.startLiveSession();
    router.push("/live");
  };

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---- Header ---- */}
        <View style={styles.homeHeader}>
          <View style={styles.homeHeaderLeft}>
            <Text style={styles.homePlanTitle}>My Plan</Text>
            <ChevronDown size={16} color={theme.muted} />
          </View>
          <View style={styles.homeHeaderRight}>
            <Pressable style={styles.headerIcon}>
              <Calendar size={20} color={theme.text} />
            </Pressable>
            <Pressable style={styles.headerIcon}>
              <SlidersHorizontal size={20} color={theme.text} />
            </Pressable>
          </View>
        </View>

        {/* ---- Filter chips ---- */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>
              Muscles ({exercises.reduce((s, e) => { s.add(e.mainMuscle); return s; }, new Set<string>()).size})
            </Text>
            <ChevronDown size={12} color={theme.muted} />
          </View>
          <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>{estimatedMinutes > 0 ? `${estimatedMinutes}-${estimatedMinutes + 10} Min` : "—"}</Text>
            <ChevronDown size={12} color={theme.muted} />
          </View>
          <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>Schedule</Text>
            <ChevronDown size={12} color={theme.muted} />
          </View>
        </ScrollView>

        {/* ---- Week calendar strip ---- */}
        <View style={styles.weekStrip}>
          {weekDates.map((d) => {
            const isSelected = d.dayIndex === selectedDay;
            const dayPlan = weekPlan?.days[d.dayIndex];
            const hasWorkout = dayPlan ? !dayPlan.isRest : false;

            return (
              <Pressable
                key={d.dayIndex}
                style={styles.dayCol}
                onPress={() => handleDayPress(d.dayIndex)}
              >
                <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>
                  {d.day}
                </Text>
                <View
                  style={[
                    styles.dayCircle,
                    isSelected && styles.dayCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayDate,
                      isSelected && styles.dayDateActive,
                    ]}
                  >
                    {d.date}
                  </Text>
                </View>
                {hasWorkout && (
                  <View
                    style={[
                      styles.dayDot,
                      isSelected && styles.dayDotActive,
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* ---- Week / Phase label ---- */}
        {weekPlan && (
          <Text style={styles.weekLabel}>
            Week {weekPlan.weekNumber}/{weekPlan.totalWeeks} – {weekPlan.phaseName}
          </Text>
        )}

        {/* ---- TODAY'S WORKOUT ---- */}
        <View style={styles.todaySection}>
          <View style={styles.todayRow}>
            <Text style={styles.todayTitle}>TODAY'S WORKOUT</Text>
            <Pressable style={styles.editIcon}>
              <Edit3 size={18} color={theme.muted} />
            </Pressable>
          </View>
          <Text style={styles.workoutTypeLabel}>{workoutLabel}</Text>
        </View>

        {isRest ? (
          <View style={styles.restCard}>
            <Text style={styles.restEmoji}>😴</Text>
            <Text style={styles.restTitle}>Rest Day</Text>
            <Text style={styles.restSubtitle}>
              Recovery is part of the plan. Take it easy today.
            </Text>
          </View>
        ) : (
          <>
            {/* ---- Stats row ---- */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Zap size={14} color={theme.neon} />
                <Text style={styles.statText}>{exercises.length} Exercises</Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={14} color={theme.neon} />
                <Text style={styles.statText}>{estimatedMinutes} Min</Text>
              </View>
              <View style={styles.statItem}>
                <Flame size={14} color={theme.neon} />
                <Text style={styles.statText}>{estimatedCal} Cal</Text>
              </View>
            </View>

            {/* ---- Exercise cards ---- */}
            {exercises.map((ex, idx) => (
              <Pressable
                key={ex.instanceId}
                style={styles.exerciseCard}
                onPress={() => router.push(`/exercise/${ex.exerciseId}`)}
              >
                <View style={styles.exerciseThumb}>
                  {ex.gif ? (
                    <Image
                      source={{ uri: ex.gif }}
                      style={styles.exerciseThumbImg}
                      contentFit="cover"
                    />
                  ) : (
                    <Dumbbell size={22} color={theme.neon} />
                  )}
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName} numberOfLines={1}>
                    {ex.title}
                  </Text>
                  <Text style={styles.exerciseMeta}>
                    {ex.sets} sets x {ex.reps} reps
                    {ex.restSeconds ? ` x ${ex.restSeconds}s rest` : ""}
                  </Text>
                </View>
                <Pressable style={styles.exercisePlayBtn}>
                  <Info size={18} color={theme.neon} />
                </Pressable>
              </Pressable>
            ))}
          </>
        )}

        {/* Spacer for bottom button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ---- START WORKOUT CTA ---- */}
      {!isRest && exercises.length > 0 && (
        <View style={styles.ctaContainer}>
          <Pressable style={styles.startBtn} onPress={handleStartWorkout}>
            <Text style={styles.startBtnText}>START WORKOUT</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

/* ===== OTHER SCREENS (unchanged logic) ===== */

export function LibraryScreen() {
  const [query, setQuery] = useState("");
  const add = useWorkoutStore((s) => s.addExercise);
  const exercises = useMemo(() => filterExercises({ search: query }), [query]);

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Exercise library</Text>
      <View style={styles.searchBar}>
        <Search color={theme.muted} size={18} />
        <TextInput
          placeholder="Search exercises"
          placeholderTextColor={theme.muted}
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />
      </View>
      <FlatList
        data={exercises}
        keyExtractor={(x) => x._id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.libExercise}
            onPress={() => router.push(`/exercise/${item._id}`)}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: MUSCLE_COLORS[item.mainMuscle ?? ""] ?? theme.neon },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.muted}>
                {item.mainMuscle} · {item.difficulty}
              </Text>
            </View>
            <Pressable
              hitSlop={10}
              onPress={() => {
                add(createWorkoutExercise(item, "hypertrophy"));
                Alert.alert("Added", `${item.title} is in your builder.`);
              }}
            >
              <Plus color={theme.neon} />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

export function BuilderScreen() {
  const s = useWorkoutStore();
  const render = ({ item, drag, isActive }: RenderItemParams<WorkoutExercise>) => (
    <Pressable
      onLongPress={drag}
      disabled={isActive}
      style={[styles.libExercise, isActive && { opacity: 0.7 }]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: MUSCLE_COLORS[item.mainMuscle] ?? theme.neon },
        ]}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.muted}>
          {item.sets} sets × {item.reps} reps · {item.restSeconds}s rest
        </Text>
        <View style={styles.editRow}>
          {(["sets", "reps", "restSeconds"] as const).map((k) => (
            <Pressable
              key={k}
              style={styles.editBtn}
              onPress={() =>
                s.updateExercise(item.instanceId, {
                  [k]: Math.max(0, Number(item[k]) + 1),
                } as Partial<WorkoutExercise>)
              }
            >
              <Text style={styles.small}>+ {k}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Pressable onPress={() => s.removeExercise(item.instanceId)}>
        <Trash2 color={theme.danger} />
      </Pressable>
    </Pressable>
  );

  if (!s.currentWorkout.length)
    return (
      <View style={[styles.page, styles.center]}>
        <Dumbbell color={theme.neon} size={42} />
        <Text style={styles.title}>Empty rack</Text>
        <Text style={styles.muted}>
          Generate a workout or add moves from Library.
        </Text>
      </View>
    );

  return (
    <View style={styles.page}>
      <TextInput
        value={s.workoutName}
        onChangeText={s.setWorkoutName}
        style={styles.nameInput}
        placeholder="Workout name"
        placeholderTextColor={theme.muted}
      />
      <DraggableFlatList
        data={s.currentWorkout}
        keyExtractor={(x) => x.instanceId}
        renderItem={render}
        onDragEnd={({ data }) =>
          s.reorderExercises(0, 0) ||
          useWorkoutStore.setState({ currentWorkout: data })
        }
      />
      <Pressable
        style={styles.legacyButton}
        onPress={() => {
          s.saveCurrentWorkout();
          s.startLiveSession();
          router.push("/live");
        }}
      >
        <Play fill={theme.background} color={theme.background} />
        <Text style={styles.legacyButtonText}>Start workout</Text>
      </Pressable>
    </View>
  );
}

export function HistoryScreen() {
  const history = useWorkoutStore((s) => s.history);

  return (
    <FlatList
      contentContainerStyle={styles.page}
      data={history}
      keyExtractor={(x) => x.id}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>History</Text>
          <Text style={styles.muted}>{history.length} completed sessions</Text>
        </>
      }
      ListEmptyComponent={
        <Text style={styles.muted}>
          Finish a live workout to see it here.
        </Text>
      }
      renderItem={({ item }) => (
        <View style={styles.libExercise}>
          <Flame color={theme.ember} />
          <View>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.muted}>
              {new Date(item.completedAt).toLocaleDateString()} · {item.totalSets}{" "}
              sets
            </Text>
          </View>
        </View>
      )}
    />
  );
}

export function LiveScreen() {
  const s = useWorkoutStore();
  const [elapsed, setElapsed] = useState(0);
  const ex = s.currentWorkout[s.liveIndex];

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((n) => n + 1);
      s.tickRest();
    }, 1000);
    return () => clearInterval(id);
  }, [s]);

  if (!ex) return null;

  if (s.livePhase === "done")
    return (
      <View style={[styles.page, styles.center]}>
        <Text style={styles.hero}>Workout complete</Text>
        <Pressable
          style={styles.legacyButton}
          onPress={() => {
            s.finishWorkout(elapsed);
            router.replace("/(tabs)/history" as any);
          }}
        >
          <Text style={styles.legacyButtonText}>Save to history</Text>
        </Pressable>
      </View>
    );

  return (
    <View style={[styles.page, styles.center]}>
      <Text style={styles.eyebrow}>
        {s.livePhase === "rest"
          ? "REST"
          : `EXERCISE ${s.liveIndex + 1}/${s.currentWorkout.length}`}
      </Text>
      <Text style={styles.hero}>
        {s.livePhase === "rest" ? `${s.restRemaining}s` : ex.title}
      </Text>
      <Text style={styles.muted}>
        {s.livePhase === "rest"
          ? "Breathe. Reset. Go again."
          : `Set ${s.liveSet} of ${ex.sets} · ${ex.reps} reps`}
      </Text>
      <Pressable
        style={styles.legacyButton}
        onPress={() =>
          s.livePhase === "rest" ? s.skipRest() : s.completeSet()
        }
      >
        <Text style={styles.legacyButtonText}>
          {s.livePhase === "rest" ? "Skip rest" : "Complete set"}
        </Text>
      </Pressable>
    </View>
  );
}

export function ExerciseDetail({ id }: { id: string }) {
  const e = getExerciseById(id);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  if (!e)
    return (
      <View style={styles.page}>
        <Text style={styles.title}>Exercise not found</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Title & meta */}
      <Text style={styles.title}>{e.title}</Text>
      <Text style={styles.muted}>
        {e.mainMuscle} · {e.difficulty} · {e.category}
      </Text>

      {/* Image */}
      <View style={styles.imageCard}>
        {imgLoading && !imgError && (
          <View style={styles.imagePlaceholder}>
            <ActivityIndicator color={theme.neon} size="large" />
          </View>
        )}
        {imgError ? (
          <View style={styles.imagePlaceholder}>
            <Dumbbell color={theme.muted} size={40} />
            <Text style={[styles.muted, { marginTop: 8, textAlign: "center" }]}>
              No image available.{"\n"}Update the image URL manually.
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: e.image }}
            style={styles.detailImage}
            contentFit="cover"
            onLoadStart={() => {
              setImgLoading(true);
              setImgError(false);
            }}
            onLoad={() => setImgLoading(false)}
            onError={() => {
              setImgLoading(false);
              setImgError(true);
            }}
          />
        )}
      </View>

      {/* Equipment tags */}
      {e.equipment?.length > 0 && (
        <View style={styles.editRow}>
          {e.equipment.map((eq) => (
            <View key={eq} style={styles.pill}>
              <Text style={styles.pillText}>{eq}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Steps */}
      <Text style={styles.eyebrow}>HOW TO</Text>
      {e.steps.map((x, i) => (
        <View key={x} style={styles.stepRow}>
          <View style={styles.stepNum}>
            <Text style={styles.stepNumText}>{i + 1}</Text>
          </View>
          <Text style={styles.step}>{x}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

/* ================================================================
 *  STYLES
 * ================================================================ */

const styles = StyleSheet.create({
  /* -- Shared -- */
  page: {
    flexGrow: 1,
    backgroundColor: theme.background,
    padding: 20,
    gap: 14,
  },
  scrollContent: {
    paddingBottom: 20,
    gap: 8,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },

  /* -- Typography -- */
  eyebrow: {
    color: theme.neon,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },
  hero: {
    color: theme.text,
    fontSize: 32,
    fontWeight: "900",
  },
  neon: { color: theme.neon },
  title: {
    color: theme.text,
    fontSize: 24,
    fontWeight: "800",
  },
  muted: {
    color: theme.muted,
    fontSize: 13,
  },
  small: {
    color: theme.muted,
    fontSize: 11,
    textTransform: "uppercase",
  },
  cardTitle: {
    color: theme.text,
    fontWeight: "800",
    fontSize: 15,
  },

  /* -- Homepage header -- */
  homeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 8,
  },
  homeHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  homePlanTitle: {
    color: theme.text,
    fontSize: 22,
    fontWeight: "900",
  },
  homeHeaderRight: {
    flexDirection: "row",
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
  },

  /* -- Filter chips -- */
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.surface,
  },
  filterChipText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "600",
  },

  /* -- Week strip -- */
  weekStrip: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  dayCol: {
    alignItems: "center",
    gap: 6,
    minWidth: 40,
  },
  dayName: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  dayNameActive: {
    color: theme.neon,
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleActive: {
    backgroundColor: theme.neon,
  },
  dayDate: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "700",
  },
  dayDateActive: {
    color: theme.background,
    fontWeight: "900",
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.muted,
  },
  dayDotActive: {
    backgroundColor: theme.neon,
  },

  /* -- Week label -- */
  weekLabel: {
    color: theme.neon,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 6,
    letterSpacing: 0.3,
  },

  /* -- Today section -- */
  todaySection: {
    gap: 4,
    paddingTop: 8,
  },
  todayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  todayTitle: {
    color: theme.text,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  editIcon: {
    padding: 6,
  },
  workoutTypeLabel: {
    color: theme.muted,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },

  /* -- Rest day card -- */
  restCard: {
    ...card,
    padding: 32,
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  restEmoji: {
    fontSize: 48,
  },
  restTitle: {
    color: theme.text,
    fontSize: 22,
    fontWeight: "900",
  },
  restSubtitle: {
    color: theme.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },

  /* -- Stats row -- */
  statsRow: {
    flexDirection: "row",
    gap: 20,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "600",
  },

  /* -- Exercise card -- */
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    gap: 14,
    marginBottom: 8,
  },
  exerciseThumb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  exerciseThumbImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  exerciseInfo: {
    flex: 1,
    gap: 3,
  },
  exerciseName: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "800",
  },
  exerciseMeta: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "500",
  },
  exercisePlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(8, 253, 142, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* -- CTA Button -- */
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: theme.background,
  },
  startBtn: {
    backgroundColor: theme.neon,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.neon,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  startBtnText: {
    color: theme.background,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 2,
  },

  /* -- Shared pill -- */
  pill: {
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 99,
  },
  pillActive: {
    borderColor: theme.neon,
    backgroundColor: "#173d18",
  },
  pillText: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
  },

  /* -- Library / Builder / Legacy -- */
  searchBar: {
    ...card,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: theme.text,
    padding: 12,
  },
  libExercise: {
    ...card,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginBottom: 10,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 10,
  },
  nameInput: {
    ...card,
    color: theme.text,
    padding: 14,
    fontSize: 18,
    fontWeight: "800",
  },
  editRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  editBtn: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 7,
    padding: 5,
  },
  legacyButton: {
    backgroundColor: theme.neon,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  legacyButtonText: {
    color: theme.background,
    fontWeight: "900",
  },

  /* -- Exercise detail -- */
  imageCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.neon,
    overflow: "hidden",
    marginBottom: 4,
  },
  detailImage: {
    width: "100%",
    height: 260,
  },
  imagePlaceholder: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#173d18",
    borderWidth: 1,
    borderColor: theme.neon,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepNumText: {
    color: theme.neon,
    fontWeight: "900",
    fontSize: 13,
  },
  step: {
    color: theme.text,
    lineHeight: 23,
    fontSize: 15,
    flex: 1,
  },
});
