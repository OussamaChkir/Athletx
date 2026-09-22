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
import { getExerciseImageSource } from "@/lib/exercise-image";
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
                      source={getExerciseImageSource(ex.gif)}
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
              <View key={p.id} style={{ flexDirection: "row", alignItems: "center" }}>
                <Pressable
                  style={[styles.dropdownItem, s.activePlanId === p.id && styles.dropdownItemActive, { flex: 1 }]}
                  onPress={() => {
                    s.setActivePlan(p.id);
                    setPlanDropdownVisible(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, s.activePlanId === p.id && styles.dropdownItemTextActive]}>
                    {p.name}
                  </Text>
                </Pressable>
                {s.plans.length > 1 && (
                  <Pressable
                    style={{ padding: 12 }}
                    onPress={() => {
                      Alert.alert(
                        "Delete Plan",
                        `Are you sure you want to delete "${p.name}"?`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: () => s.deletePlan(p.id)
                          }
                        ]
                      );
                    }}
                  >
                    <Trash2 size={18} color={theme.danger} />
                  </Pressable>
                )}
              </View>
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
  { id: "1", category: "FULL BODY", title: "TITAN AWAKENING", duration: "45M", programLength: 4, daysPerWeek: 3, exercises: ["6c26f0a1f16b4c0cb078ea11", "93d9d9a4c7784c30bc61f212", "7e98a9f926a14828b088b1a6", "5e1a164552484a30a6fdd9ae", "92dc15f8c78c4de9a38433a4", "292cb10f62224d51a4870bca", "bc2a45caa09346d59637137c", "871005c833264f8089a581a3"], icon: "Flame" },
  { id: "2", category: "CHEST", title: "PEC DESTROYER", duration: "30M", programLength: 4, daysPerWeek: 2, exercises: ["6c26f0a1f16b4c0cb078ea11", "24c5b920e3cb4e168d966284", "4bd77467112f4c2d993d14cc", "606d1a1773a84a80924f1882", "7e98a9f926a14828b088b1a6"], icon: "Zap" },
  { id: "3", category: "LEGS", title: "SQUAT PROTOCOL", duration: "60M", programLength: 6, daysPerWeek: 2, exercises: ["292cb10f62224d51a4870bca", "93d9d9a4c7784c30bc61f212", "5e1a164552484a30a6fdd9ae", "44a8b8d5df0941a39fac6a01", "c02331ff2d714cccb2e30c4e", "fb1c1f88ceaf409e9ef2e235"], icon: "Zap" },
  { id: "4", category: "MOBILITY", title: "MORNING FLOW", duration: "15M", programLength: 4, daysPerWeek: 5, exercises: ["871005c833264f8089a581a3", "c02331ff2d714cccb2e30c4e", "44a8b8d5df0941a39fac6a01", "292cb10f62224d51a4870bca"], icon: "Leaf" },
  { id: "5", category: "BACK", title: "V-TAPER BUILD", duration: "45M", programLength: 8, daysPerWeek: 2, exercises: ["92dc15f8c78c4de9a38433a4", "cc4187e70cd34865a99f4159", "05c884512a1d4f6684f8ed0e", "771e86eac943463d862a70f9", "dd755011db094327bd571ff8", "7d52e04fc9564352abf1a3d1"], icon: "Flame" },
  { id: "6", category: "HIIT", title: "CARDIO SHRED", duration: "20M", programLength: 4, daysPerWeek: 3, exercises: ["93d9d9a4c7784c30bc61f212", "7e98a9f926a14828b088b1a6", "871005c833264f8089a581a3", "c02331ff2d714cccb2e30c4e", "292cb10f62224d51a4870bca"], icon: "Zap" },
];

export function LibraryScreen() {
  const [query, setQuery] = useState("");
  const s = useWorkoutStore();

  const handleEnroll = (workout: typeof PREPARED_WORKOUTS[0]) => {
    const allExs = workout.exercises.map(id => {
      const ex = getExerciseById(id);
      return ex ? createWorkoutExercise(ex, "hypertrophy") : null;
    }).filter(Boolean) as typeof s.currentWorkout;

    const days: DayPlan[] = [];
    const activeDays = [1, 3, 5, 2, 4, 6].slice(0, workout.daysPerWeek).sort();

    const chunks: (typeof s.currentWorkout)[] = Array.from({ length: workout.daysPerWeek }, () => []);
    allExs.forEach((ex, idx) => {
      // Create new instance ID for each exercise so they are unique if repeated
      chunks[idx % workout.daysPerWeek].push({ ...ex, instanceId: Math.random().toString() });
    });

    let chunkIdx = 0;
    for (let i = 0; i < 7; i++) {
      if (activeDays.includes(i)) {
        days.push({
          dayIndex: i,
          label: `Day ${chunkIdx + 1}`,
          isRest: false,
          exercises: chunks[chunkIdx]
        });
        chunkIdx++;
      } else {
        days.push({
          dayIndex: i,
          label: "Rest",
          isRest: true,
          exercises: []
        });
      }
    }

    const newPlan = {
      id: Math.random().toString(),
      name: workout.title,
      weekNumber: 1,
      totalWeeks: workout.programLength,
      phaseName: workout.category,
      days
    };

    s.addPlan(newPlan);
    Alert.alert("Enrolled", `You have successfully enrolled in ${workout.title}!`);
    router.replace("/(tabs)/train" as any);
  };

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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, flexShrink: 0, marginBottom: 20 }} contentContainerStyle={styles.discoverChips}>
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
            <Pressable style={styles.discoverCard} onPress={() => router.push(`/workout/${item.id}` as any)}>
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
                  <Text style={styles.discoverCardMetaText}>{item.exercises.length}X</Text>
                </View>
                <Pressable style={styles.discoverPlayBtn} onPress={() => handleEnroll(item)}>
                  <Plus size={12} color={theme.text} />
                </Pressable>
              </View>
            </Pressable>
          )}
        />
      </SafeAreaView>
      <AdBanner />
    </View>
  );
}

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  Beginner:     { bg: "rgba(8,253,142,0.12)",  text: "#08fd8e" },
  Intermediate: { bg: "rgba(255,159,10,0.12)", text: "#ff9f0a" },
  Advanced:     { bg: "rgba(255,92,114,0.12)", text: "#ff5c72" },
};

const ALL_MUSCLES_LABEL = "All";

export function BuilderScreen() {
  const [query, setQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<string>(ALL_MUSCLES_LABEL);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const allExercises = useMemo(() => filterExercises({ includeExcluded: true }), []);

  const muscles = useMemo(() => {
    const set = new Set(allExercises.map((e) => e.targets?.[0] ?? "Unknown"));
    return [ALL_MUSCLES_LABEL, ...Array.from(set).filter(Boolean).sort()];
  }, [allExercises]);

  const categories = useMemo(() => {
    const set = new Set(allExercises.map((e) => e.category));
    return ["All", ...Array.from(set).filter(Boolean).sort()];
  }, [allExercises]);

  const filtered = useMemo(() => {
    return allExercises.filter((e) => {
      const matchesMuscle =
        selectedMuscle === ALL_MUSCLES_LABEL ||
        (e.targets?.[0] ?? "") === selectedMuscle;
      const matchesCategory =
        selectedCategory === "All" || e.category === selectedCategory;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.targets.some((t) => t.toLowerCase().includes(q)) ||
        e.equipment.some((eq) => eq.toLowerCase().includes(q));
      return matchesMuscle && matchesCategory && matchesQuery;
    });
  }, [allExercises, selectedMuscle, selectedCategory, query]);

  const muscleColor = (muscle: string) =>
    MUSCLE_COLORS[muscle] ?? theme.neon;

  return (
    <SafeAreaView style={bStyles.root}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <View style={bStyles.header}>
        <View>
          <Text style={bStyles.headTitle}>EXERCISE</Text>
          <Text style={bStyles.headSub}>LIBRARY</Text>
        </View>
        <View style={bStyles.countBadge}>
          <Text style={bStyles.countText}>{filtered.length}</Text>
        </View>
      </View>

      {/* ── Search ── */}
      <View style={bStyles.searchRow}>
        <Search color={theme.muted} size={16} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search exercises, muscles, equipment…"
          placeholderTextColor={theme.muted}
          style={bStyles.searchInput}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")}>
            <X color={theme.muted} size={16} />
          </Pressable>
        )}
      </View>

      {/* ── Muscle Filter Chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={bStyles.chipsRow}
        style={bStyles.chipsScroll}
        alwaysBounceHorizontal={false}
      >
        {muscles.map((m) => {
          const active = m === selectedMuscle;
          const color = m === ALL_MUSCLES_LABEL ? theme.neon : muscleColor(m);
          return (
            <Pressable
              key={m}
              onPress={() => setSelectedMuscle(m)}
              style={[
                bStyles.chip,
                active && { backgroundColor: color + "22", borderColor: color },
              ]}
            >
              {m !== ALL_MUSCLES_LABEL && (
                <View style={[bStyles.chipDot, { backgroundColor: color }]} />
              )}
              <Text
                style={[
                  bStyles.chipText,
                  active && { color },
                ]}
              >
                {m}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Category Chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={bStyles.catChipsRow}
        style={bStyles.catChipsScroll}
        alwaysBounceHorizontal={false}
      >
        {categories.map((cat) => {
          const active = cat === selectedCategory;
          return (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                bStyles.catChip,
                active && bStyles.catChipActive,
              ]}
            >
              <Text
                style={[
                  bStyles.catChipText,
                  active && bStyles.catChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Exercise List ── */}
      <FlatList
        data={filtered}
        keyExtractor={(e) => e._id}
        contentContainerStyle={bStyles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={bStyles.empty}>
            <Dumbbell color={theme.muted} size={40} />
            <Text style={bStyles.emptyTitle}>No exercises found</Text>
            <Text style={bStyles.emptyMuted}>Try a different search or filter</Text>
          </View>
        }
        renderItem={({ item: e }) => {
          const muscle = e.targets?.[0] ?? "Unknown";
          const mColor = muscleColor(muscle);
          const diff = DIFFICULTY_COLORS[e.difficulty] ?? DIFFICULTY_COLORS.Beginner;
          return (
            <Pressable
              style={bStyles.card}
              onPress={() => router.push(`/exercise/${e._id}` as any)}
            >
              {/* Left accent bar */}
              <View style={[bStyles.accentBar, { backgroundColor: mColor }]} />

              {/* Image */}
              <View style={bStyles.imgWrap}>
                {e.image ? (
                  <Image
                    source={getExerciseImageSource(e.image)}
                    style={bStyles.img}
                    contentFit="contain"
                    transition={200}
                  />
                ) : (
                  <View style={bStyles.imgPlaceholder}>
                    <Dumbbell color={theme.muted} size={24} />
                  </View>
                )}
              </View>

              {/* Text content */}
              <View style={bStyles.cardBody}>
                <Text style={bStyles.cardTitle} numberOfLines={2}>
                  {e.title}
                </Text>

                {/* Muscle + Category row */}
                <View style={bStyles.tagsRow}>
                  <View style={[bStyles.muscleTag, { borderColor: mColor + "55" }]}>
                    <View style={[bStyles.tagDot, { backgroundColor: mColor }]} />
                    <Text style={[bStyles.muscleTagText, { color: mColor }]}>
                      {muscle}
                    </Text>
                  </View>
                  <View style={bStyles.catTag}>
                    <Text style={bStyles.catTagText}>{e.category}</Text>
                  </View>
                </View>

                {/* Equipment */}
                {e.equipment?.length > 0 && (
                  <Text style={bStyles.equipment} numberOfLines={1}>
                    {e.equipment.join(" · ")}
                  </Text>
                )}
              </View>

              {/* Difficulty badge */}
              <View style={[bStyles.diffBadge, { backgroundColor: diff.bg }]}>
                <Text style={[bStyles.diffText, { color: diff.text }]}>
                  {e.difficulty}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
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
    if (s.livePhase === "done") return;
    const id = setInterval(() => {
      setElapsed((n) => n + 1);
      s.tickRest();
    }, 1000);
    return () => clearInterval(id);
  }, [s.livePhase, s]);

  if (!ex) return null;

  if (s.livePhase === "done") {
    let totalVolume = 0;
    s.currentWorkout.forEach(ex => {
      ex.loggedSets.forEach(set => {
        if (set.weight) totalVolume += set.weight * set.reps;
      });
    });

    return (
      <View style={styles.livePage}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.liveHeader}>
            <Text style={styles.liveTimer}>Workout Complete</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: "center", marginBottom: 32 }}>
              <Flame size={48} color={theme.neon} />
              <Text style={[styles.hero, { marginTop: 16, fontSize: 32 }]}>Great Job!</Text>
              <Text style={[styles.muted, { marginTop: 8, fontSize: 18 }]}>Time: {formatTime(elapsed)}</Text>
              {totalVolume > 0 && <Text style={[styles.muted, { marginTop: 4, fontSize: 16 }]}>Total Volume: {totalVolume} kg</Text>}
            </View>

            <Text style={[styles.eyebrow, { marginBottom: 16 }]}>EXERCISE SUMMARY</Text>
            {s.currentWorkout.map((ex, i) => (
              <View key={ex.instanceId} style={{ marginBottom: 16, backgroundColor: theme.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}>
                <Text style={styles.cardTitle}>{ex.title}</Text>
                <View style={{ marginTop: 8 }}>
                  {ex.loggedSets.map((set, setIdx) => (
                    <View key={setIdx} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
                      <Text style={styles.muted}>Set {setIdx + 1}</Text>
                      <Text style={{ color: theme.text }}>
                        {set.reps} reps {set.weight ? `× ${set.weight} kg` : ""}
                      </Text>
                    </View>
                  ))}
                  {ex.loggedSets.length === 0 && (
                    <Text style={styles.muted}>Skipped</Text>
                  )}
                </View>
              </View>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={styles.liveFooter}>
            <Pressable
              style={styles.completeSetBtn}
              onPress={() => {
                s.finishWorkout(elapsed);
                router.replace("/(tabs)/train" as any);
              }}
            >
              <Text style={styles.completeSetBtnText}>FINISH & GO HOME</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

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
              source={getExerciseImageSource(e.image)}
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

export function WorkoutDetailScreen({ id }: { id: string }) {
  const workout = PREPARED_WORKOUTS.find((w) => w.id === id);
  const s = useWorkoutStore();
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

  useEffect(() => {
    if (workout) {
      const generated = workout.exercises
        .map(id => getExerciseById(id))
        .filter((e): e is NonNullable<typeof e> => e !== undefined)
        .map(e => createWorkoutExercise(e, "hypertrophy"));
      setExercises(generated);
    }
  }, [workout]);

  if (!workout) {
    return (
      <View style={detailStyles.notFound}>
        <Dumbbell color={theme.muted} size={48} />
        <Text style={detailStyles.notFoundText}>Workout not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: theme.neon, marginTop: 20 }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleEnroll = () => {
    if (!exercises.length || !workout) return;

    const days: DayPlan[] = [];
    const activeDays = [1, 3, 5, 2, 4, 6].slice(0, workout.daysPerWeek).sort();

    const chunks: WorkoutExercise[][] = Array.from({ length: workout.daysPerWeek }, () => []);
    exercises.forEach((ex, idx) => {
      chunks[idx % workout.daysPerWeek].push({ ...ex, instanceId: Math.random().toString() });
    });

    let chunkIdx = 0;
    for (let i = 0; i < 7; i++) {
      if (activeDays.includes(i)) {
        days.push({
          dayIndex: i,
          label: `Day ${chunkIdx + 1}`,
          isRest: false,
          exercises: chunks[chunkIdx]
        });
        chunkIdx++;
      } else {
        days.push({
          dayIndex: i,
          label: "Rest",
          isRest: true,
          exercises: []
        });
      }
    }

    const planId = Math.random().toString(36).slice(2);
    s.addPlan({
      id: planId,
      name: workout.title,
      weekNumber: 1,
      totalWeeks: workout.programLength,
      phaseName: workout.category,
      days,
    });
    s.setActivePlan(planId);
    Alert.alert("Enrolled", `You have successfully enrolled in ${workout.title}!`);
    router.replace("/(tabs)/train" as any);
  };

  const estimatedMinutes = parseInt(workout.duration) ||
    Math.round(exercises.reduce((t, e) => t + e.sets * (0.75 + e.restSeconds / 60), 0));

  const words = workout.title.trim().split(" ");
  const firstWord = words[0];
  const restWords = words.slice(1).join(" ");

  return (
    <View style={detailStyles.root}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={detailStyles.headerSafe}>
        <View style={detailStyles.header}>
          <Pressable style={detailStyles.headerBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color={theme.text} />
          </Pressable>
          <Text style={detailStyles.headerTitle}>WORKOUT PLAN</Text>
          <View style={{ width: 42 }} />
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={detailStyles.scrollBody} showsVerticalScrollIndicator={false}>
        <Text style={detailStyles.titleRow}>
          <Text style={detailStyles.titleWhite}>{firstWord}</Text>
          {restWords ? (
            <Text style={detailStyles.titleNeon}>{" "}{restWords}</Text>
          ) : null}
        </Text>

        <View style={detailStyles.metaRow}>
          <Text style={detailStyles.metaMuscle}>{workout.category}</Text>
          <Text style={detailStyles.metaDot}>·</Text>
          <Text style={detailStyles.metaDiff}>{workout.duration}</Text>
          <Text style={detailStyles.metaDot}>·</Text>
          <Text style={detailStyles.metaMuscle}>{workout.programLength} WEEKS</Text>
          <Text style={detailStyles.metaDot}>·</Text>
          <Text style={detailStyles.metaDiff}>{workout.daysPerWeek} DAYS/WK</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Zap size={14} color={theme.neon} />
            <Text style={styles.statText}>{exercises.length} Exercises</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={14} color={theme.neon} />
            <Text style={styles.statText}>{estimatedMinutes} Min</Text>
          </View>
        </View>

        <View style={detailStyles.howToHeader}>
          <ListOrdered size={16} color={theme.neon} />
          <Text style={detailStyles.howToLabel}>EXERCISES</Text>
        </View>

        <View style={{ gap: 8, marginTop: 8 }}>
          {exercises.map((ex) => (
            <Pressable
              key={ex.instanceId}
              style={styles.exerciseCard}
              onPress={() => router.push(`/exercise/${ex.exerciseId}` as any)}
            >
              <View style={styles.exerciseThumb}>
                {ex.gif ? (
                  <Image source={getExerciseImageSource(ex.gif)} style={styles.exerciseThumbImg} contentFit="cover" />
                ) : (
                  <Dumbbell size={22} color={theme.neon} />
                )}
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName} numberOfLines={1}>{ex.title}</Text>
                <Text style={styles.exerciseMeta}>{ex.sets} sets x {ex.reps} reps</Text>
              </View>
            </Pressable>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={detailStyles.ctaContainer}>
        <Pressable style={detailStyles.startBtn} onPress={handleEnroll}>
          <Text style={detailStyles.startBtnText}>ENROLL & ADD PLAN</Text>
          <View style={detailStyles.startBtnIcon}>
            <Plus size={18} color={theme.background} />
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
    paddingVertical: 6,
    gap: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  discoverChip: {
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 20,
    paddingVertical: 8,
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

/* ================================================================
 *  BUILDER SCREEN — Exercise Library styles
 * ================================================================ */
const bStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.background,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headTitle: {
    color: theme.text,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  headSub: {
    color: theme.neon,
    fontSize: 28,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -0.5,
    lineHeight: 30,
    marginTop: -4,
  },
  countBadge: {
    backgroundColor: "rgba(8,253,142,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.neon,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  countText: {
    color: theme.neon,
    fontSize: 16,
    fontWeight: "900",
  },

  /* Search */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 14,
    height: 46,
  },
  searchInput: {
    flex: 1,
    color: theme.text,
    fontSize: 14,
  },

  /* Chips */
  chipsScroll: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 8,
  },
  chipsRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "700",
  },

  /* Category chips */
  catChipsScroll: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 8,
  },
  catChipsRow: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  catChipActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.2)",
  },
  catChipText: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  catChipTextActive: {
    color: theme.text,
  },

  /* List */
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 10,
  },

  /* Exercise card */
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: "hidden",
    minHeight: 90,
  },
  accentBar: {
    width: 4,
    alignSelf: "stretch",
  },
  imgWrap: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    flexShrink: 0,
  },
  img: {
    width: 76,
    height: 76,
  },
  imgPlaceholder: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 8,
    gap: 5,
  },
  cardTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  muscleTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  muscleTagText: {
    fontSize: 11,
    fontWeight: "800",
  },
  catTag: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  catTagText: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  equipment: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: "500",
  },

  /* Difficulty badge */
  diffBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginRight: 12,
    alignSelf: "center",
  },
  diffText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  /* Empty state */
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "800",
  },
  emptyMuted: {
    color: theme.muted,
    fontSize: 14,
  },
});
