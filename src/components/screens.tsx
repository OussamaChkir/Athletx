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
  Modal,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Image } from "expo-image";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { router } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  Dumbbell,
  Edit3,
  Flame,
  Info,
  ListOrdered,
  Play,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
  Zap,
  X,
  Minus,
  Leaf,
} from "lucide-react-native";
import { EQUIPMENT_LIST, FOCUS_PRESETS, MUSCLES, MUSCLE_COLORS } from "@/lib/constants";
import { createWorkoutExercise, filterExercises, getExerciseById, generateWorkout } from "@/lib/exercises";
import { theme } from "@/lib/theme";
import type { WorkoutExercise, WorkoutFocus } from "@/lib/types";
import { useWorkoutStore, type DayPlan } from "@/store/workout-store";
import { AdBanner } from "@/components/AdBanner";

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
  const [planDropdownVisible, setPlanDropdownVisible] = useState(false);

  const weekPlan = s.plans.find((p) => p.id === s.activePlanId) ?? null;
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
          <Pressable 
            style={styles.homeHeaderLeft}
            onPress={() => setPlanDropdownVisible(true)}
          >
            <Text style={styles.homePlanTitle}>{weekPlan?.name || "My Plan"}</Text>
            <ChevronDown size={16} color={theme.muted} />
          </Pressable>
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
            <Text style={styles.todayTitle}>TODAY&apos;S WORKOUT</Text>
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

      {/* ---- Plan Dropdown Modal ---- */}
      <Modal visible={planDropdownVisible} transparent animationType="fade">
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setPlanDropdownVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            <Text style={styles.dropdownTitle}>Switch Plan</Text>
            {s.plans.map(p => (
              <Pressable 
                key={p.id} 
                style={[styles.dropdownItem, s.activePlanId === p.id && styles.dropdownItemActive]}
                onPress={() => {
                  s.setActivePlan(p.id);
                  setPlanDropdownVisible(false);
                }}
              >
                <Text style={[styles.dropdownItemText, s.activePlanId === p.id && styles.dropdownItemTextActive]}>
                  {p.name}
                </Text>
              </Pressable>
            ))}
            <Pressable 
              style={styles.dropdownAddBtn}
              onPress={() => {
                setPlanDropdownVisible(false);
                router.push("/plan/new" as any);
              }}
            >
              <Plus size={16} color={theme.neon} />
              <Text style={styles.dropdownAddText}>Add New Plan</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

/* ===== OTHER SCREENS (unchanged logic) ===== */

const PREPARED_WORKOUTS = [
  { id: "1", category: "FULL BODY", title: "TITAN AWAKENING", duration: "45M", exercises: 8, icon: "Flame" },
  { id: "2", category: "CHEST", title: "PEC DESTROYER", duration: "30M", exercises: 5, icon: "Zap" },
  { id: "3", category: "LEGS", title: "SQUAT PROTOCOL", duration: "60M", exercises: 6, icon: "Zap" },
  { id: "4", category: "MOBILITY", title: "MORNING FLOW", duration: "15M", exercises: 12, icon: "Leaf" },
  { id: "5", category: "BACK", title: "V-TAPER BUILD", duration: "45M", exercises: 6, icon: "Flame" },
  { id: "6", category: "HIIT", title: "CARDIO SHRED", duration: "20M", exercises: 5, icon: "Zap" },
];

export function LibraryScreen() {
  const [query, setQuery] = useState("");
  const s = useWorkoutStore();

  const handlePlay = (workout: typeof PREPARED_WORKOUTS[0]) => {
    const muscleMap: Record<string, string[]> = {
      "FULL BODY": ["Chest", "Lats", "Quads"],
      "CHEST": ["Chest"],
      "LEGS": ["Quads", "Hamstrings"],
      "MOBILITY": ["Lower back", "Abdominals"],
      "BACK": ["Lats", "Traps"],
      "HIIT": ["Quads", "Calves"],
    };
    const targetMuscles = muscleMap[workout.category] || ["Chest"];
    
    const generated = generateWorkout(["dumbbell", "bodyweight"], targetMuscles as any, {
      exerciseCount: workout.exercises,
      focus: "hypertrophy",
      difficulties: [],
    });
    
    useWorkoutStore.setState({ currentWorkout: generated, workoutName: workout.title });
    s.startLiveSession();
    router.push("/live" as any);
  };

  return (
    <View style={styles.discoverPage}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.discoverHeader}>
          <View>
            <Text style={styles.discoverTitleWhite}>DISCOVER</Text>
            <Text style={styles.discoverTitleNeon}>WORKOUTS</Text>
          </View>
          <Pressable style={styles.discoverCloseBtn}>
            <X size={20} color={theme.neon} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.discoverSearchContainer}>
          <Search color={theme.muted} size={18} />
          <TextInput
            placeholder="Search workouts, muscles..."
            placeholderTextColor={theme.muted}
            value={query}
            onChangeText={setQuery}
            style={styles.discoverInput}
          />
          <SlidersHorizontal color={theme.muted} size={18} />
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 50, marginBottom: 20 }} contentContainerStyle={styles.discoverChips}>
          {["ALL", "STRENGTH", "CARDIO", "MOBILITY"].map((chip, idx) => (
            <Pressable key={chip} style={[styles.discoverChip, idx === 0 && styles.discoverChipActive]}>
              <Text style={[styles.discoverChipText, idx === 0 && styles.discoverChipTextActive]}>{chip}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Grid */}
        <FlatList
          data={PREPARED_WORKOUTS}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.discoverGridRow}
          contentContainerStyle={styles.discoverGridContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.discoverCard}>
              <View style={styles.discoverCardHeader}>
                <View style={[styles.discoverCategoryPill, 
                  item.category === "LEGS" ? { backgroundColor: "#1c2a47" } : 
                  item.category === "MOBILITY" ? { backgroundColor: "#2d1b4e" } : 
                  item.category === "CHEST" ? { backgroundColor: "#173d2a" } : 
                  item.category === "BACK" ? { backgroundColor: "#173d2a" } : 
                  { backgroundColor: "rgba(255,255,255,0.1)" }
                ]}>
                  <Text style={[styles.discoverCategoryText, 
                    item.category === "LEGS" ? { color: "#6b9cf6" } : 
                    item.category === "MOBILITY" ? { color: "#b388ff" } : 
                    item.category === "CHEST" ? { color: "#08fd8e" } : 
                    item.category === "BACK" ? { color: "#08fd8e" } : 
                    { color: theme.text }
                  ]}>{item.category}</Text>
                </View>
                {item.icon === "Flame" ? <Flame size={14} color="#ff453a" /> : 
                 item.icon === "Zap" ? <Zap size={14} color="#ff9f0a" /> : 
                 <Leaf size={14} color="#30d158" />}
              </View>

              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text style={styles.discoverCardTitle}>{item.title}</Text>
              </View>

              <View style={styles.discoverCardFooter}>
                <View style={styles.discoverCardMeta}>
                  <Clock size={10} color={theme.muted} />
                  <Text style={styles.discoverCardMetaText}>{item.duration}</Text>
                  <Text style={styles.discoverCardMetaDot}>·</Text>
                  <ListOrdered size={10} color={theme.muted} />
                  <Text style={styles.discoverCardMetaText}>{item.exercises}X</Text>
                </View>
                <Pressable style={styles.discoverPlayBtn} onPress={() => handlePlay(item)}>
                  <Play size={12} color={theme.text} fill={theme.text} />
                </Pressable>
              </View>
            </View>
          )}
        />
      </SafeAreaView>
      <AdBanner />
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
      <AdBanner />
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

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function LiveScreen() {
  const s = useWorkoutStore();
  const [elapsed, setElapsed] = useState(0);
  const ex = s.currentWorkout[s.liveIndex];
  const nextEx = s.currentWorkout[s.liveIndex + 1];

  const [currentReps, setCurrentReps] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");

  useEffect(() => {
    if (s.livePhase === "exercise" && ex) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentReps(ex.reps.toString());
      // weight is left intact if they are on same exercise
    }
  }, [s.liveIndex, s.liveSet, s.livePhase, ex]);

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
        <Text style={[styles.muted, { marginTop: 8 }]}>Time: {formatTime(elapsed)}</Text>
        <Pressable
          style={[styles.legacyButton, { marginTop: 24 }]}
          onPress={() => {
            s.finishWorkout(elapsed);
            router.replace("/(tabs)/history" as any);
          }}
        >
          <Text style={styles.legacyButtonText}>Save to history</Text>
        </Pressable>
      </View>
    );

  const handleCancelWorkout = () => {
    Alert.alert(
      "End Workout Early?",
      "Your progress will not be saved.",
      [
        { text: "Keep Going", style: "cancel" },
        { 
          text: "End Workout", 
          style: "destructive", 
          onPress: () => {
            s.cancelWorkout();
            router.replace("/(tabs)/train" as any);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.livePage}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.liveHeader}>
          <Pressable onPress={handleCancelWorkout} style={styles.liveHeaderIcon}>
            <X size={24} color={theme.text} />
          </Pressable>
          <Text style={styles.liveTimer}>{formatTime(elapsed)}</Text>
          <View style={styles.liveHeaderIcon} />
        </View>

        <ScrollView contentContainerStyle={styles.liveContent} bounces={false}>
          {s.livePhase === "rest" ? (
            <View style={styles.restContainer}>
              <Text style={styles.restEyebrow}>REST</Text>
              <View style={styles.restCircle}>
                <Text style={styles.restTimeText}>{formatTime(s.restRemaining)}</Text>
              </View>
              
              <View style={styles.restControls}>
                <Pressable style={styles.restControlBtn} onPress={() => s.reduceRestTime(15)}>
                  <Minus size={20} color={theme.text} />
                  <Text style={styles.restControlText}>15s</Text>
                </Pressable>
                <Pressable style={styles.skipRestBtn} onPress={s.skipRest}>
                  <Text style={styles.skipRestBtnText}>SKIP REST</Text>
                </Pressable>
                <Pressable style={styles.restControlBtn} onPress={() => s.addRestTime(15)}>
                  <Plus size={20} color={theme.text} />
                  <Text style={styles.restControlText}>15s</Text>
                </Pressable>
              </View>

              <View style={styles.nextUpContainer}>
                <Text style={styles.nextUpLabel}>NEXT UP</Text>
                {s.liveSet >= ex.sets && nextEx ? (
                  <Text style={styles.nextUpText}>{nextEx.title} ({nextEx.sets}x{nextEx.reps})</Text>
                ) : (
                  <Text style={styles.nextUpText}>{ex.title} - Set {s.liveSet + 1}/{ex.sets}</Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.exerciseContainer}>
              <Text style={styles.eyebrow}>EXERCISE {s.liveIndex + 1}/{s.currentWorkout.length}</Text>
              <Text style={styles.liveExerciseTitle}>{ex.title}</Text>
              <Text style={styles.muted}>Set {s.liveSet} of {ex.sets}</Text>

              <View style={styles.liveInputsRow}>
                <View style={styles.liveInputGroup}>
                  <Text style={styles.liveInputLabel}>REPS</Text>
                  <TextInput
                    style={styles.liveInput}
                    keyboardType="number-pad"
                    value={currentReps}
                    onChangeText={setCurrentReps}
                    placeholder={ex.reps.toString()}
                    placeholderTextColor={theme.muted}
                  />
                </View>
                <View style={styles.liveInputGroup}>
                  <Text style={styles.liveInputLabel}>KGS</Text>
                  <TextInput
                    style={styles.liveInput}
                    keyboardType="decimal-pad"
                    value={currentWeight}
                    onChangeText={setCurrentWeight}
                    placeholder="—"
                    placeholderTextColor={theme.muted}
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {s.livePhase === "exercise" && (
          <View style={styles.liveFooter}>
            <Pressable
              style={styles.completeSetBtn}
              onPress={() => s.completeSet(Number(currentReps) || ex.reps, Number(currentWeight) || undefined)}
            >
              <Text style={styles.completeSetBtnText}>COMPLETE SET</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

export function ExerciseDetail({ id }: { id: string }) {
  const e = getExerciseById(id);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  if (!e)
    return (
      <View style={detailStyles.notFound}>
        <Dumbbell color={theme.muted} size={48} />
        <Text style={detailStyles.notFoundText}>Exercise not found</Text>
      </View>
    );

  // Split title: first word white, rest neon
  const words = e.title.trim().split(" ");
  const firstWord = words[0];
  const restWords = words.slice(1).join(" ");

  return (
    <View style={detailStyles.root}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <SafeAreaView style={detailStyles.headerSafe}>
        <View style={detailStyles.header}>
          <Pressable style={detailStyles.headerBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color={theme.text} />
          </Pressable>
          <Text style={detailStyles.headerTitle}>EXERCISE</Text>
          <Pressable style={detailStyles.headerBtn}>
            <Settings size={20} color={theme.text} />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* ── Scrollable body ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={detailStyles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={detailStyles.titleRow}>
          <Text style={detailStyles.titleWhite}>{firstWord}</Text>
          {restWords ? (
            <Text style={detailStyles.titleNeon}>{" "}{restWords}</Text>
          ) : null}
        </Text>

        {/* Meta tags */}
        <View style={detailStyles.metaRow}>
          <Text style={detailStyles.metaMuscle}>{(e.mainMuscle ?? "").toUpperCase()}</Text>
          <Text style={detailStyles.metaDot}>·</Text>
          <Text style={detailStyles.metaDiff}>{e.difficulty.toUpperCase()}</Text>
          <Text style={detailStyles.metaDot}>·</Text>
          <Text style={detailStyles.metaMuscle}>{(e.category ?? "").toUpperCase()}</Text>
        </View>

        {/* GIF / Image preview */}
        <View style={detailStyles.imageCard}>
          {imgLoading && !imgError && (
            <View style={detailStyles.imagePlaceholder}>
              <ActivityIndicator color={theme.neon} size="large" />
            </View>
          )}
          {imgError ? (
            <View style={detailStyles.imagePlaceholder}>
              <Dumbbell color={theme.muted} size={40} />
              <Text style={detailStyles.noImgText}>No image available</Text>
            </View>
          ) : (
            <Image
              source={{ uri: e.image }}
              style={detailStyles.detailImage}
              contentFit="cover"
              onLoadStart={() => { setImgLoading(true); setImgError(false); }}
              onLoad={() => setImgLoading(false)}
              onError={() => { setImgLoading(false); setImgError(true); }}
            />
          )}
        </View>

        {/* Equipment pills */}
        {e.equipment?.length > 0 && (
          <View style={detailStyles.pillsRow}>
            {e.equipment.map((eq) => (
              <View key={eq} style={detailStyles.equipPill}>
                <Dumbbell size={13} color={theme.muted} />
                <Text style={detailStyles.equipPillText}>{eq.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        )}

        {/* HOW TO */}
        <View style={detailStyles.howToHeader}>
          <ListOrdered size={16} color={theme.neon} />
          <Text style={detailStyles.howToLabel}>HOW TO</Text>
        </View>

        <View style={detailStyles.stepsContainer}>
          {e.steps.map((step, i) => (
            <View key={i} style={detailStyles.stepRow}>
              <View style={detailStyles.stepNum}>
                <Text style={detailStyles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={detailStyles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Bottom spacer for the fixed CTA */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Fixed START EXERCISE button ── */}
      <View style={detailStyles.ctaContainer}>
        <Pressable
          style={detailStyles.startBtn}
          onPress={() => router.back()}
        >
          <Text style={detailStyles.startBtnText}>START EXERCISE</Text>
          <View style={detailStyles.startBtnIcon}>
            <Play size={18} color={theme.background} fill={theme.background} />
          </View>
        </Pressable>
      </View>
    </View>
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

  /* -- Exercise detail (legacy stubs kept for other callers) -- */
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

  /* -- Modal / Dropdown -- */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 80,
    paddingLeft: 20,
  },
  dropdownMenu: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    width: 200,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  dropdownTitle: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    padding: 8,
  },
  dropdownItem: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  dropdownItemActive: {
    backgroundColor: "rgba(8, 253, 142, 0.1)",
  },
  dropdownItemText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "600",
  },
  dropdownItemTextActive: {
    color: theme.neon,
  },
  dropdownAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    marginTop: 4,
  },
  dropdownAddText: {
    color: theme.neon,
    fontSize: 15,
    fontWeight: "700",
  },
  
  /* -- Live Screen Redesign -- */
  livePage: {
    flex: 1,
    backgroundColor: theme.background,
  },
  liveHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  liveHeaderIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  liveTimer: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  liveContent: {
    padding: 20,
    flexGrow: 1,
  },
  exerciseContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  liveExerciseTitle: {
    color: theme.text,
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  liveInputsRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 40,
    width: "100%",
  },
  liveInputGroup: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 20,
    alignItems: "center",
  },
  liveInputLabel: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 10,
  },
  liveInput: {
    color: theme.neon,
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    width: "100%",
  },
  liveFooter: {
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  completeSetBtn: {
    backgroundColor: theme.neon,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  completeSetBtnText: {
    color: theme.background,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
  },
  restContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  restEyebrow: {
    color: theme.neon,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 4,
    marginBottom: 40,
  },
  restCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 8,
    borderColor: theme.neon,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    shadowColor: theme.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  restTimeText: {
    color: theme.text,
    fontSize: 64,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  restControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 60,
  },
  restControlBtn: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  restControlText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "800",
  },
  skipRestBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  skipRestBtnText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
  nextUpContainer: {
    width: "100%",
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
  },
  nextUpLabel: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
  },
  nextUpText: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "700",
  },
  
  /* -- Discover Workouts -- */
  discoverPage: {
    flex: 1,
    backgroundColor: theme.background,
  },
  discoverHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  discoverTitleWhite: {
    color: theme.text,
    fontSize: 32,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -1,
  },
  discoverTitleNeon: {
    color: theme.neon,
    fontSize: 32,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -1,
    marginTop: -8,
  },
  discoverCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  discoverSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    height: 50,
    gap: 12,
  },
  discoverInput: {
    flex: 1,
    color: theme.text,
    fontSize: 15,
  },
  discoverChips: {
    paddingHorizontal: 20,
    gap: 12,
  },
  discoverChip: {
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  discoverChipActive: {
    backgroundColor: theme.neon,
    borderColor: theme.neon,
  },
  discoverChipText: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  discoverChipTextActive: {
    color: theme.background,
  },
  discoverGridRow: {
    justifyContent: "space-between",
  },
  discoverGridContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  discoverCard: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    minHeight: 180,
    justifyContent: "space-between",
  },
  discoverCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  discoverCategoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discoverCategoryText: {
    fontSize: 10,
    fontWeight: "900",
  },
  discoverCardTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -0.5,
    marginTop: 16,
  },
  discoverCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  discoverCardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  discoverCardMetaText: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  discoverCardMetaDot: {
    color: theme.muted,
    fontSize: 10,
  },
  discoverPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
});

/* ================================================================
 *  EXERCISE DETAIL — dedicated styles
 * ================================================================ */
const detailStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.background,
  },

  /* Not-found state */
  notFound: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    color: theme.muted,
    fontSize: 18,
    fontWeight: "700",
  },

  /* Header */
  headerSafe: {
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 3,
  },

  /* Scroll body */
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 16,
  },

  /* Title */
  titleRow: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 1,
    lineHeight: 40,
    flexWrap: "wrap",
  },
  titleWhite: {
    color: theme.text,
    fontSize: 34,
    fontWeight: "900",
  },
  titleNeon: {
    color: theme.neon,
    fontSize: 34,
    fontWeight: "900",
  },

  /* Meta */
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  metaMuscle: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  metaDiff: {
    color: theme.neon,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  metaDot: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
  },

  /* GIF / image card */
  imageCard: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: "hidden",
  },
  detailImage: {
    width: "100%",
    height: 220,
  },
  imagePlaceholder: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  noImgText: {
    color: theme.muted,
    fontSize: 13,
    marginTop: 4,
  },

  /* Equipment pills */
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  equipPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: theme.surface,
  },
  equipPillText: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  /* HOW TO header */
  howToHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: -4,
  },
  howToLabel: {
    color: theme.neon,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2,
  },

  /* Steps */
  stepsContainer: {
    gap: 18,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  stepNum: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.neon,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  stepNumText: {
    color: theme.background,
    fontWeight: "900",
    fontSize: 14,
  },
  stepText: {
    color: theme.text,
    lineHeight: 24,
    fontSize: 15,
    flex: 1,
    fontWeight: "500",
  },

  /* CTA */
  ctaContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
  },
  startBtn: {
    backgroundColor: theme.neon,
    height: 60,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: theme.neon,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  startBtnText: {
    color: theme.background,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 2.5,
  },
  startBtnIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
