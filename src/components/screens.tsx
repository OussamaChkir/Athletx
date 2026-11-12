import { useEffect, useMemo, useRef, useState } from "react";
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
  Animated,
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { getExerciseImageSource } from "@/lib/exercise-image";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { router } from "expo-router";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  getDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import {
  ArrowLeft,
  Calendar,
  CalendarCheck,
  ChevronDown,
  Clock,
  Crown,
  Dumbbell,
  Edit3,
  Flame,
  Info,
  Play,
  Plus,
  Search,
  Settings,
  Trash2,
  Zap,
  X,
  Minus,
  Lock,
  Trophy,
  Activity,
  Target
} from "lucide-react-native";
import { EQUIPMENT_LIST, FOCUS_PRESETS, MUSCLES } from "@/lib/constants";
import { filterExercises, getExerciseById } from "@/lib/exercises";
import { colors, fonts, radius, spacing, theme } from "@/lib/theme";
import {
  PROGRAMS,
  buildDayExercises,
  dayMinutes,
  getProgram,
  programEquipment,
  programIndex,
  programMinutes,
  type ProgramLevel,
} from "@/lib/programs";
import { AppText, Button, Chip, StatCard } from "@/components/kit";
import type { WorkoutFocus } from "@/lib/types";
import { useWorkoutStore, type DayPlan } from "@/store/workout-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useWeightUnit } from "@/lib/units";
import { convertWeight, fromKg, roundWeight, toKg } from "@/lib/weight";
import { BodyWeightCard } from "@/components/body-weight-card";
import { PremiumPopup } from "@/components/premium-popup";
import type { PaywallReason } from "@/lib/entitlements";
import { usePremiumAccess } from "@/lib/use-premium-access";
import {
  ADS_SUPPORTED,
  REWARDED_UNLOCK_MS,
  isMeaningfulSession,
  preloadInterstitial,
  preloadRewarded,
  showInterstitialThen,
  showRewardedForWorkout,
  useRewardedStatus,
} from "@/lib/ads";
/*import { AdBanner } from "@/components/AdBanner"; */

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
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [paywallReason, setPaywallReason] = useState<PaywallReason | null>(null);
  const [premiumVisible, setPremiumVisible] = useState(false);
  const access = usePremiumAccess();

  // Weekly Streak Calculation
  const history = s.history;
  const today = useMemo(() => new Date(), []);
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 });
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 0 });

  const workoutsThisWeek = useMemo(() => {
    return history.filter((h) => {
      const d = new Date(h.completedAt);
      return d >= startOfCurrentWeek && d <= endOfCurrentWeek;
    });
  }, [history, startOfCurrentWeek, endOfCurrentWeek]);

  // Calendar Grid (Current Month)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(monthStart);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startingDayIndex = getDay(monthStart);
    return Array(startingDayIndex).fill(null).concat(daysInMonth);
  }, [today]);

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
        <View style={trainStyles.header}>
          <Pressable
            style={trainStyles.headerTitle}
            onPress={() => setPlanDropdownVisible(true)}
          >
            <AppText variant="titleLarge" numberOfLines={1} style={{ flexShrink: 1 }}>
              {weekPlan?.name || "My Plan"}
            </AppText>
            <ChevronDown size={20} color={colors.textPrimary} />
          </Pressable>
          <View style={trainStyles.headerActions}>
            <Pressable
              style={[trainStyles.iconButton, { backgroundColor: colors.accent }]}
              onPress={() => setPremiumVisible(true)}
              accessibilityRole="button"
              accessibilityLabel={access.isPremium ? "Premium" : "Go Premium"}
            >
              <Crown size={20} color={colors.textOnAccent} />
            </Pressable>
            <Pressable
              style={[trainStyles.iconButton, { backgroundColor: colors.bgSurface }]}
              onPress={() => setCalendarVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Open calendar"
            >
              <Calendar size={20} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        {/* ---- Filter chips ---- */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={trainStyles.filtersRow}
        >
          <View style={trainStyles.filterChip}>
            <AppText variant="labelLarge">
              Muscles ({new Set(exercises.map((e) => e.mainMuscle)).size})
            </AppText>
            <ChevronDown size={14} color={colors.textSecondary} />
          </View>
          <View style={trainStyles.filterChip}>
            <AppText variant="labelLarge">
              {estimatedMinutes > 0 ? `${estimatedMinutes}–${estimatedMinutes + 10} Min` : "—"}
            </AppText>
            <ChevronDown size={14} color={colors.textSecondary} />
          </View>
        </ScrollView>

        {/* ---- Week calendar strip ---- */}
        <View style={trainStyles.weekStrip}>
          {weekDates.map((d) => {
            const isSelected = d.dayIndex === selectedDay;
            const dayPlan = weekPlan?.days[d.dayIndex];
            const hasWorkout = dayPlan ? !dayPlan.isRest : false;

            return (
              <Pressable
                key={d.dayIndex}
                style={[
                  trainStyles.dayPill,
                  { backgroundColor: isSelected ? colors.accent : "transparent" },
                ]}
                onPress={() => handleDayPress(d.dayIndex)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <AppText variant="caption" color={isSelected ? "textOnAccent" : "textSecondary"}>
                  {d.day}
                </AppText>
                <AppText variant="titleSmall" color={isSelected ? "textOnAccent" : "textPrimary"}>
                  {d.date}
                </AppText>
                <View
                  style={[
                    trainStyles.dayDot,
                    {
                      backgroundColor: !hasWorkout
                        ? "transparent"
                        : isSelected
                          ? colors.textOnAccent
                          : colors.accent,
                    },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>

        {/* ---- Week / Phase label ---- */}
        {weekPlan && (
          <AppText variant="labelLarge" color="accent" style={{ textAlign: "center" }}>
            Week {weekPlan.weekNumber}/{weekPlan.totalWeeks} – {weekPlan.phaseName}
          </AppText>
        )}

        {/* ---- TODAY'S WORKOUT ---- */}
        <View style={trainStyles.todaySection}>
          <AppText variant="caption" color="textSecondary" style={{ letterSpacing: 1 }}>
            TODAY&apos;S WORKOUT
          </AppText>
          <AppText variant="titleMedium">{workoutLabel}</AppText>
        </View>

        {isRest ? (
          <View style={trainStyles.restCard}>
            <Text style={{ fontSize: 48 }}>😴</Text>
            <AppText variant="titleMedium">Rest Day</AppText>
            <AppText variant="bodyMedium" color="textSecondary" style={{ textAlign: "center" }}>
              Recovery is part of the plan. Take it easy today.
            </AppText>
          </View>
        ) : (
          <>
            {/* ---- Stats row ---- */}
            <View style={trainStyles.statsRow}>
              <View style={trainStyles.statItem}>
                <Zap size={16} color={colors.accent} />
                <AppText variant="labelLarge">{exercises.length} Exercises</AppText>
              </View>
              <View style={trainStyles.statItem}>
                <Clock size={16} color={colors.accent} />
                <AppText variant="labelLarge">{estimatedMinutes} Min</AppText>
              </View>
              <View style={trainStyles.statItem}>
                <Flame size={16} color={colors.accent} />
                <AppText variant="labelLarge">{estimatedCal} Cal</AppText>
              </View>
            </View>

            {/* ---- Exercise cards ---- */}
            {exercises.map((ex) => (
              <Pressable
                key={ex.instanceId}
                style={trainStyles.exerciseCard}
                onPress={() => router.push(`/exercise/${ex.exerciseId}`)}
              >
                <View style={trainStyles.exerciseThumb}>
                  {ex.gif ? (
                    <Image
                      source={getExerciseImageSource(ex.gif)}
                      style={trainStyles.exerciseThumbImg}
                      contentFit="cover"
                    />
                  ) : (
                    <Dumbbell size={22} color={colors.accent} />
                  )}
                </View>
                <View style={trainStyles.exerciseInfo}>
                  <AppText variant="titleSmall" numberOfLines={1}>
                    {ex.title}
                  </AppText>
                  <AppText variant="bodyMedium" color="textSecondary">
                    {ex.sets} sets × {ex.reps} reps
                    {ex.restSeconds ? ` × ${ex.restSeconds}s rest` : ""}
                  </AppText>
                </View>
                <View style={trainStyles.infoButton}>
                  <Info size={18} color={colors.accent} />
                </View>
              </Pressable>
            ))}
          </>
        )}

        {/* Spacer so the last card clears the button and the floating tab bar */}
        <View style={{ height: 160 }} />
      </ScrollView>

      {/* ---- Start workout CTA ---- */}
      {!isRest && exercises.length > 0 && (
        <View style={trainStyles.ctaContainer} pointerEvents="box-none">
          <Button label="Start workout" onPress={handleStartWorkout} />
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
                {/* Edit plan button */}
                <Pressable
                  style={{ padding: 10 }}
                  onPress={() => {
                    setPlanDropdownVisible(false);
                    router.push((`/plan/new?planId=${p.id}`) as any);
                  }}
                >
                  <Edit3 size={16} color={theme.neon} />
                </Pressable>
                {s.plans.length > 1 && (
                  <Pressable
                    style={{ padding: 10 }}
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
                if (!access.canCreatePlan) {
                  // Let the dropdown modal finish dismissing before presenting the paywall (iOS can't stack modals).
                  setTimeout(() => setPaywallReason("plan_limit"), 350);
                  return;
                }
                router.push("/plan/new" as any);
              }}
            >
              {access.canCreatePlan ? (
                <Plus size={16} color={theme.neon} />
              ) : (
                <Lock size={16} color={theme.neon} />
              )}
              <Text style={styles.dropdownAddText}>Add New Plan</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <PremiumPopup
        visible={paywallReason !== null || premiumVisible}
        reason={paywallReason ?? undefined}
        onClose={() => {
          setPaywallReason(null);
          setPremiumVisible(false);
        }}
      />

      {/* ---- Calendar Modal ---- */}
      <Modal visible={calendarVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCalendarVisible(false)}
        >
          <Pressable style={styles.calendarModalContent} onPress={() => { }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={styles.calendarTitle}>{format(today, "MMMM yyyy")}</Text>
              <Pressable onPress={() => setCalendarVisible(false)}>
                <X size={24} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.streakContainer}>
              <Flame size={20} color={theme.neon} />
              <Text style={styles.streakText}>
                {workoutsThisWeek.length} {workoutsThisWeek.length === 1 ? 'workout' : 'workouts'} this week
              </Text>
            </View>

            <View style={styles.calendarHeaderRow}>
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <Text key={day} style={styles.calendarDayHeader}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((d, i) => {
                if (!d) return <View key={`empty-${i}`} style={styles.calendarCell} />;

                const hasWorkedOut = history.some((h) => isSameDay(new Date(h.completedAt), d));
                const isToday = isSameDay(today, d);

                return (
                  <View key={d.toString()} style={[styles.calendarCell, hasWorkedOut && styles.calendarCellWorkedOut]}>
                    <Text style={[styles.calendarCellText, hasWorkedOut && styles.calendarCellTextWorkedOut, isToday && styles.calendarCellTextToday]}>
                      {format(d, "d")}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const trainStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 40,
    gap: spacing.md,
  },
  headerTitle: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexShrink: 1 },
  headerActions: { flexDirection: "row", gap: spacing.sm },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  filtersRow: { flexDirection: "row", gap: spacing.sm, paddingVertical: spacing.xs },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
  },
  weekStrip: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.sm },
  dayPill: {
    width: 44,
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  dayDot: { width: 5, height: 5, borderRadius: 3 },
  todaySection: { gap: spacing.xs, paddingTop: spacing.sm },
  restCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    padding: spacing["3xl"],
    alignItems: "center",
    gap: spacing.sm,
  },
  statsRow: { flexDirection: "row", gap: spacing.xl, paddingVertical: spacing.sm },
  statItem: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSurface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  exerciseThumb: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.bgInset,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  exerciseThumbImg: { width: 56, height: 56 },
  exerciseInfo: { flex: 1, gap: spacing.xs },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.bgInset,
    alignItems: "center",
    justifyContent: "center",
  },
  // Sits above the floating tab bar (see src/app/(tabs)/_layout.tsx).
  ctaContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 104,
    paddingHorizontal: spacing.xl,
  },
});

const libStyles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: 120, gap: spacing.md },
  headerBlock: { gap: spacing.md, paddingBottom: spacing.xs },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: spacing.md },
  crownButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  searchInput: { flex: 1, color: colors.textPrimary, fontFamily: fonts.jakartaRegular, fontSize: 14, padding: 0 },
  chipRow: { gap: spacing.sm },
  card: {
    flexDirection: "row",
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.lg,
  },
  cover: {
    width: 96,
    alignSelf: "stretch",
    minHeight: 132,
    borderRadius: radius.md,
    backgroundColor: colors.bgInset,
    alignItems: "center",
    justifyContent: "center",
  },
  lockCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1, gap: spacing.xs },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  crownBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, paddingTop: spacing.sm },
  tag: {
    height: 28,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.bgInset,
    justifyContent: "center",
  },
  levelRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingTop: spacing.xs },
});

/* ===== OTHER SCREENS (unchanged logic) ===== */

const LIBRARY_LEVELS = ["All", "Beginner", "Intermediate", "Advanced"] as const;
const LIBRARY_DAYS = [
  { label: "All", match: (_n: number) => true },
  { label: "1 Day", match: (n: number) => n === 1 },
  { label: "2 Days", match: (n: number) => n === 2 },
  { label: "3 Days", match: (n: number) => n === 3 },
  { label: "4+ Days", match: (n: number) => n >= 4 },
] as const;
const LEVEL_BARS: Record<ProgramLevel, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 };
const BAR_HEIGHTS = { sm: [4, 7, 10], md: [6, 10, 14] } as const;

/** Three-bar difficulty indicator; `level` is Beginner / Intermediate / Advanced (anything else shows one bar). */
function LevelBars({ level, size = "md" }: { level: string; size?: "sm" | "md" }) {
  const filled = LEVEL_BARS[level as ProgramLevel] ?? 1;
  const heights = BAR_HEIGHTS[size];
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, height: heights[2] }}>
      {heights.map((h, i) => (
        <View
          key={h}
          style={{ width: 3, height: h, borderRadius: 2, backgroundColor: i < filled ? colors.accent : colors.textMuted }}
        />
      ))}
    </View>
  );
}
const toTitleCase = (t: string) => t.toLowerCase().replace(/(^|[\s-])([a-z])/g, (_, sep, c) => sep + c.toUpperCase());

export function LibraryScreen() {
  const [query, setQuery] = useState("");
  const [paywallReason, setPaywallReason] = useState<PaywallReason | null>(null);
  const access = usePremiumAccess();

  // Warm the rewarded ad so "Watch an ad to unlock" is ready by the time a locked workout is opened.
  useEffect(() => {
    preloadRewarded();
  }, []);

  // Where ads run, a locked workout opens its page, which offers "Watch an ad to unlock" alongside Premium.
  // Elsewhere (no ads) it goes straight to the paywall, as before.
  const openLockedWorkout = (workoutId: string) =>
    ADS_SUPPORTED ? router.push(`/workout/${workoutId}` as any) : setPaywallReason("prepared_workout");

  const [level, setLevel] = useState<(typeof LIBRARY_LEVELS)[number]>("All");
  const [days, setDays] = useState<(typeof LIBRARY_DAYS)[number]["label"]>("All");

  const programs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const dayFilter = LIBRARY_DAYS.find((d) => d.label === days)!;
    return PROGRAMS.filter((w) => {
      if (level !== "All" && w.level !== level) return false;
      if (!dayFilter.match(w.days.length)) return false;
      if (!q) return true;
      return [w.title, w.subtitle, w.category, w.equipment, w.focus, w.level].some((t) =>
        t.toLowerCase().includes(q),
      );
    });
  }, [query, level, days]);

  return (
    <View style={styles.discoverPage}>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={programs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={libStyles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={libStyles.headerBlock}>
              <View style={libStyles.header}>
                <AppText variant="titleLarge">Library</AppText>
                <Pressable
                  style={libStyles.crownButton}
                  onPress={() => setPaywallReason("prepared_workout")}
                  accessibilityRole="button"
                  accessibilityLabel={access.isPremium ? "Premium" : "Go Premium"}
                >
                  <Crown size={22} color={colors.textOnAccent} />
                </Pressable>
              </View>

              <View style={libStyles.search}>
                <TextInput
                  placeholder="Search programs, exercises"
                  placeholderTextColor={colors.textMuted}
                  value={query}
                  onChangeText={setQuery}
                  returnKeyType="search"
                  style={libStyles.searchInput}
                />
                <Search color={colors.textSecondary} size={20} />
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={libStyles.chipRow}>
                {LIBRARY_LEVELS.map((l) => (
                  <Chip key={l} label={l} selected={level === l} onPress={() => setLevel(l)} />
                ))}
              </ScrollView>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={libStyles.chipRow}>
                {LIBRARY_DAYS.map((d) => (
                  <Chip key={d.label} label={d.label} selected={days === d.label} onPress={() => setDays(d.label)} />
                ))}
              </ScrollView>
            </View>
          }
          ListEmptyComponent={
            <AppText variant="bodyMedium" color="textSecondary" style={{ textAlign: "center", paddingTop: spacing["3xl"] }}>
              No programs match your filters.
            </AppText>
          }
          renderItem={({ item }) => {
            const locked = access.isPreparedWorkoutLocked(programIndex(item.id), item.id);
            return (
              <Pressable
                style={libStyles.card}
                onPress={() => (locked ? openLockedWorkout(item.id) : router.push(`/workout/${item.id}` as any))}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}, ${item.level}${locked ? ", Premium" : ""}`}
              >
                {/* Image slot: programs get cover images later; until then an inset placeholder. */}
                <View style={libStyles.cover}>
                  {locked ? (
                    <View style={libStyles.lockCircle}>
                      <Lock size={22} color={colors.accent} />
                    </View>
                  ) : (
                    <Dumbbell size={40} color={colors.textMuted} />
                  )}
                </View>

                <View style={libStyles.cardBody}>
                  <View style={libStyles.titleRow}>
                    <AppText variant="titleSmall" numberOfLines={1} style={{ flex: 1 }}>
                      {toTitleCase(item.title)}
                    </AppText>
                    {locked ? (
                      <View style={libStyles.crownBadge}>
                        <Crown size={14} color={colors.textOnAccent} />
                      </View>
                    ) : null}
                  </View>
                  <AppText variant="bodyMedium" color="textSecondary">
                    {item.subtitle}
                  </AppText>
                  <View style={libStyles.tags}>
                    {[
                      item.equipment,
                      item.focus,
                      `${item.programLength} weeks`,
                      `${item.days.length} days/week`,
                    ].map((t) => (
                      <View key={t} style={libStyles.tag}>
                        <AppText variant="labelMedium" color="textSecondary">
                          {t}
                        </AppText>
                      </View>
                    ))}
                  </View>
                  <View style={libStyles.levelRow}>
                    <LevelBars level={item.level} />
                    <AppText variant="labelMedium" color="textSecondary">
                      {item.level === "Beginner" ? "Easy" : item.level}
                    </AppText>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      </SafeAreaView>

      <PremiumPopup
        visible={paywallReason !== null}
        reason={paywallReason ?? undefined}
        onClose={() => setPaywallReason(null)}
      />
    </View>
  );
}

const ALL_MUSCLES_LABEL = "All";

const DIFFICULTY_LABEL: Record<string, string> = { Beginner: "Easy", Intermediate: "Intermediate", Advanced: "Hard" };

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

  return (
    <SafeAreaView style={exStyles.root}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={filtered}
        keyExtractor={(e) => e._id}
        contentContainerStyle={exStyles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={exStyles.headerBlock}>
            <AppText variant="titleLarge" style={{ paddingTop: spacing.md }}>
              Exercise <AppText variant="titleLarge" color="accent">Library</AppText>
            </AppText>

            <View style={libStyles.search}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search exercises, muscles, equipment…"
                placeholderTextColor={colors.textMuted}
                style={libStyles.searchInput}
                returnKeyType="search"
              />
              {query.length > 0 ? (
                <Pressable onPress={() => setQuery("")} accessibilityRole="button" accessibilityLabel="Clear search">
                  <X color={colors.textSecondary} size={20} />
                </Pressable>
              ) : (
                <Search color={colors.textSecondary} size={20} />
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={libStyles.chipRow}>
              {muscles.map((m) => (
                <Chip key={m} dot label={m} selected={m === selectedMuscle} onPress={() => setSelectedMuscle(m)} />
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={libStyles.chipRow}>
              {categories.map((cat) => (
                <Chip key={cat} label={cat} selected={cat === selectedCategory} onPress={() => setSelectedCategory(cat)} />
              ))}
            </ScrollView>

            <View style={exStyles.legend}>
              <AppText variant="caption" color="textSecondary">
                Difficulty
              </AppText>
              {(["Beginner", "Intermediate", "Advanced"] as const).map((level) => (
                <View key={level} style={exStyles.legendItem}>
                  <LevelBars level={level} size="sm" />
                  <AppText variant="caption" color="textSecondary">
                    {DIFFICULTY_LABEL[level]}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={exStyles.empty}>
            <Dumbbell color={colors.textMuted} size={40} />
            <AppText variant="titleSmall">No exercises found</AppText>
            <AppText variant="bodyMedium" color="textSecondary">
              Try a different search or filter
            </AppText>
          </View>
        }
        renderItem={({ item: e }) => {
          const muscle = e.targets?.[0] ?? "Unknown";
          return (
            <Pressable
              style={exStyles.card}
              onPress={() => router.push(`/exercise/${e._id}` as any)}
              accessibilityRole="button"
              accessibilityLabel={`${e.title}, ${DIFFICULTY_LABEL[e.difficulty] ?? e.difficulty}`}
            >
              <View style={exStyles.thumb}>
                {e.image ? (
                  <Image source={getExerciseImageSource(e.image)} style={exStyles.thumbImg} contentFit="contain" transition={200} />
                ) : (
                  <Dumbbell color={colors.textMuted} size={32} />
                )}
              </View>

              <View style={exStyles.cardBody}>
                <AppText variant="titleSmall" numberOfLines={2}>
                  {e.title}
                </AppText>
                <View style={exStyles.tags}>
                  <View style={exStyles.tag}>
                    <View style={exStyles.tagDot} />
                    <AppText variant="labelMedium" color="accent">
                      {muscle}
                    </AppText>
                  </View>
                  <View style={exStyles.tag}>
                    <AppText variant="labelMedium">{e.category}</AppText>
                  </View>
                </View>
                {e.equipment?.length > 0 ? (
                  <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                    {e.equipment.join(" · ")}
                  </AppText>
                ) : null}
              </View>

              <View style={exStyles.diffCircle}>
                <LevelBars level={e.difficulty} />
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

function ProgressListHeader() {
  const history = useWorkoutStore((s) => s.history);
  const totalWorkouts = history.length;
  const totalTimeSeconds = history.reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const totalWeight = history.reduce((acc, curr) => acc + curr.totalVolume, 0);
  const unit = useWeightUnit();

  const streak = useMemo(() => {
    if (!history.length) return 0;
    const dates = [...new Set(history.map(h => new Date(h.completedAt).toDateString()))]
      .map(dStr => new Date(dStr))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dates[0].getTime() !== today.getTime() && dates[0].getTime() !== yesterday.getTime()) {
      return 0;
    }

    let expectedDate = dates[0];
    for (const date of dates) {
      if (date.getTime() === expectedDate.getTime()) {
        currentStreak++;
        expectedDate = new Date(date);
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak;
  }, [history]);

  return (
    <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
      <View style={{ marginBottom: 24 }}>
        <Text style={[styles.title, { fontSize: 32 }]}>Progress</Text>
        <Text style={styles.muted}>Your fitness journey</Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <View style={{ flex: 1, minWidth: "45%", backgroundColor: "rgba(255,159,10,0.1)", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,159,10,0.2)" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Flame size={20} color="#ff9f0a" />
            <Text style={{ color: "#ff9f0a", fontWeight: "800", fontSize: 13 }}>STREAK</Text>
          </View>
          <Text style={{ color: theme.text, fontSize: 28, fontWeight: "900" }}>{streak} <Text style={{ fontSize: 16, color: theme.muted }}>days</Text></Text>
        </View>

        <View style={{ flex: 1, minWidth: "45%", backgroundColor: "rgba(8,253,142,0.1)", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(8,253,142,0.2)" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Activity size={20} color={theme.neon} />
            <Text style={{ color: theme.neon, fontWeight: "800", fontSize: 13 }}>WORKOUTS</Text>
          </View>
          <Text style={{ color: theme.text, fontSize: 28, fontWeight: "900" }}>{totalWorkouts}</Text>
        </View>

        <View style={{ flex: 1, minWidth: "45%", backgroundColor: "rgba(255,92,114,0.1)", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,92,114,0.2)" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Target size={20} color="#ff5c72" />
            <Text style={{ color: "#ff5c72", fontWeight: "800", fontSize: 13 }}>VOLUME</Text>
          </View>
          <Text style={{ color: theme.text, fontSize: 24, fontWeight: "900" }}>{Math.round(fromKg(totalWeight, unit))} <Text style={{ fontSize: 14, color: theme.muted }}>{unit}</Text></Text>
        </View>

        <View style={{ flex: 1, minWidth: "45%", backgroundColor: "rgba(179,136,255,0.1)", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(179,136,255,0.2)" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Clock size={20} color="#b388ff" />
            <Text style={{ color: "#b388ff", fontWeight: "800", fontSize: 13 }}>TIME</Text>
          </View>
          <Text style={{ color: theme.text, fontSize: 24, fontWeight: "900" }}>{Math.floor(totalTimeSeconds / 60)} <Text style={{ fontSize: 14, color: theme.muted }}>min</Text></Text>
        </View>
      </View>

      <BodyWeightCard />

      <Text style={[styles.title, { fontSize: 20, marginBottom: 8 }]}>Recent Workouts</Text>
    </View>
  );
}

export function HistoryScreen() {
  const history = useWorkoutStore((s) => s.history);
  const maxVolume = useMemo(() => Math.max(0, ...history.map(h => h.totalVolume)), [history]);
  const unit = useWeightUnit();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        contentContainerStyle={[styles.page, { paddingHorizontal: 0 }]}
        data={history}
        keyExtractor={(x) => x.id}
        ListHeaderComponent={ProgressListHeader}
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={styles.muted}>
              Finish a live workout to see it here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isPR = item.totalVolume > 0 && item.totalVolume === maxVolume;

          return (
            <View style={[styles.libExercise, { marginHorizontal: 20, marginBottom: 12, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 16 }]}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12 }}>
                <Dumbbell color={theme.neon} size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  {isPR && (
                    <View style={{ backgroundColor: 'rgba(255,215,0,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Trophy size={12} color="#ffd700" />
                      <Text style={{ color: '#ffd700', fontSize: 10, fontWeight: '900' }}>PR</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.muted}>
                  {new Date(item.completedAt).toLocaleDateString()} · {formatTime(item.durationSeconds)}
                </Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  <Text style={{ color: theme.text, fontSize: 12, fontWeight: '700' }}>
                    {item.totalSets} <Text style={{ color: theme.muted, fontWeight: '500' }}>sets</Text>
                  </Text>
                  <Text style={{ color: theme.text, fontSize: 12, fontWeight: '700' }}>
                    {Math.round(fromKg(item.totalVolume, unit))} <Text style={{ color: theme.muted, fontWeight: '500' }}>{unit}</Text>
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function LiveScreen() {
  const s = useWorkoutStore();
  const insets = useSafeAreaInsets();
  const [elapsed, setElapsed] = useState(0);
  const [restDuration, setRestDuration] = useState(0);
  const restProgress = useRef(new Animated.Value(1)).current;
  const previousRest = useRef(0);
  const ex = s.currentWorkout[s.liveIndex];
  const nextEx = s.currentWorkout[s.liveIndex + 1];

  // Weight unit is the single app-wide setting (onboarding / Edit Profile).
  const weightUnit = useWeightUnit();
  const setWeightUnit = useOnboardingStore((st) => st.setWeightUnit);

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
    if (s.livePhase === "done" || !s.sessionStartedAt) return;
    const startedAt = new Date(s.sessionStartedAt).getTime();
    const updateElapsed = () => setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    updateElapsed();
    const id = setInterval(() => {
      updateElapsed();
      s.tickRest();
    }, 1000);
    return () => clearInterval(id);
  }, [s.livePhase, s.sessionStartedAt, s.tickRest]);

  useEffect(() => {
    if (s.livePhase !== "rest") {
      previousRest.current = 0;
      return;
    }

    // Capture a new rest interval once, then adjust its total when the user
    // adds or removes time so the animated progress stays in sync.
    if (previousRest.current === 0) {
      setRestDuration(s.restRemaining);
      restProgress.setValue(1);
    } else if (s.restRemaining !== previousRest.current) {
      setRestDuration((duration) => Math.max(s.restRemaining, duration + s.restRemaining - previousRest.current));
    }
    previousRest.current = s.restRemaining;
  }, [s.livePhase, s.restRemaining, restProgress]);

  useEffect(() => {
    if (s.livePhase !== "rest" || restDuration <= 0) return;
    Animated.timing(restProgress, {
      toValue: Math.max(0, s.restRemaining / restDuration),
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, [s.livePhase, s.restRemaining, restDuration, restProgress]);

  // Load an interstitial while the user trains so it's ready at the end of the workout.
  useEffect(() => {
    preloadInterstitial();
  }, []);

  // Save the workout as soon as it's finished, before any ad can appear, and only once per session.
  const savedRef = useRef(false);
  useEffect(() => {
    if (s.livePhase !== "done" || savedRef.current || s.currentWorkout.length === 0) return;
    savedRef.current = true;
    useWorkoutStore.getState().finishWorkout(elapsed);
  }, [s.livePhase, s.currentWorkout.length, elapsed]);

  if (!ex) return null;

  if (s.livePhase === "done") {
    let totalVolume = 0;
    s.currentWorkout.forEach(ex => {
      ex.loggedSets.forEach(set => {
        if (set.weight) totalVolume += set.weight * set.reps;
      });
    });

    return (
      <View style={[styles.livePage, { paddingTop: insets.top }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.liveHeader}>
            <Text style={styles.liveTimer}>Workout Complete</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: "center", marginBottom: 32 }}>
              <Flame size={48} color={theme.neon} />
              <Text style={[styles.hero, { marginTop: 16, fontSize: 32 }]}>Great Job!</Text>
              <Text style={[styles.muted, { marginTop: 8, fontSize: 18 }]}>Time: {formatTime(elapsed)}</Text>
              {totalVolume > 0 && <Text style={[styles.muted, { marginTop: 4, fontSize: 16 }]}>Total Volume: {Math.round(fromKg(totalVolume, weightUnit))} {weightUnit}</Text>}
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
                        {set.reps} reps {set.weight ? `× ${roundWeight(fromKg(set.weight, weightUnit), 1)} ${weightUnit}` : ""}
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
                // The workout was saved when this screen appeared, so an ad here can't cost the user data.
                // If no ad is ready (or the frequency rules say no), this goes straight home.
                showInterstitialThen("workout_complete", () => router.replace("/" as any));
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
            const loggedSets = useWorkoutStore
              .getState()
              .currentWorkout.reduce((n, e) => n + e.loggedSets.length, 0);
            const worthAnAd = isMeaningfulSession(loggedSets, elapsed);
            s.cancelWorkout();
            const goHome = () => router.replace("/" as any);
            // Only after real effort in the session; if no ad is ready the user just leaves.
            if (worthAnAd) showInterstitialThen("workout_exit", goHome);
            else goHome();
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.livePage, { paddingTop: insets.top }]}>
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
                <View style={styles.restProgressTrack}>
                  <Animated.View
                    style={[
                      styles.restProgressFill,
                      { transform: [{ scaleX: restProgress }] },
                    ]}
                  />
                </View>
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
                  <Text style={styles.nextUpText}>{ex.title} - Set {s.liveSet}/{ex.sets}</Text>
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
                  {/* Label row with inline unit toggle */}
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text style={[styles.liveInputLabel, { marginBottom: 0 }]}>WEIGHT</Text>
                    <View style={{ flexDirection: "row", borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: theme.border }}>
                      <Pressable
                        onPress={() => {
                          if (weightUnit !== "kg") {
                            const parsed = parseFloat(currentWeight);
                            if (!isNaN(parsed)) {
                              setCurrentWeight(roundWeight(convertWeight(parsed, weightUnit, "kg"), 1).toString());
                            }
                            setWeightUnit("kg");
                          }
                        }}
                        style={[{
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          backgroundColor: weightUnit === "kg" ? theme.neon : "transparent",
                        }]}
                      >
                        <Text style={{ fontSize: 10, fontWeight: "900", color: weightUnit === "kg" ? theme.background : theme.muted }}>KG</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          if (weightUnit !== "lb") {
                            const parsed = parseFloat(currentWeight);
                            if (!isNaN(parsed)) {
                              setCurrentWeight(roundWeight(convertWeight(parsed, weightUnit, "lb"), 1).toString());
                            }
                            setWeightUnit("lb");
                          }
                        }}
                        style={[{
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          backgroundColor: weightUnit === "lb" ? theme.neon : "transparent",
                        }]}
                      >
                        <Text style={{ fontSize: 10, fontWeight: "900", color: weightUnit === "lb" ? theme.background : theme.muted }}>LB</Text>
                      </Pressable>
                    </View>
                  </View>
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
              onPress={() => {
                const rawWeight = parseFloat(currentWeight);
                // Always store weight in kg internally
                const weightInKg = isNaN(rawWeight)
                  ? undefined
                  : roundWeight(toKg(rawWeight, weightUnit), 2);
                s.completeSet(Number(currentReps) || ex.reps, weightInKg);
              }}
            >
              <Text style={styles.completeSetBtnText}>COMPLETE SET</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const LIFTER_NOTE: Record<string, string> = {
  Beginner: "Beginner friendly",
  Intermediate: "Some experience",
  Advanced: "Advanced lifters",
};

function MuscleTag({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <View style={[exStyles.muscleTag, { backgroundColor: primary ? colors.accent : colors.bgSurface }]}>
      <View style={[exStyles.tagDot, { backgroundColor: primary ? colors.textOnAccent : colors.accent }]} />
      <AppText variant="labelLarge" color={primary ? "textOnAccent" : "textPrimary"}>
        {label}
      </AppText>
    </View>
  );
}

export function ExerciseDetail({ id }: { id: string }) {
  const e = getExerciseById(id);
  const [imgError, setImgError] = useState(false);
  const insets = useSafeAreaInsets();

  if (!e)
    return (
      <View style={detailStyles.notFound}>
        <Dumbbell color={theme.muted} size={48} />
        <Text style={detailStyles.notFoundText}>Exercise not found</Text>
      </View>
    );

  const primary = e.primary_muscles?.length ? e.primary_muscles : [e.mainMuscle ?? e.targets?.[0]].filter(Boolean) as string[];
  const secondary = e.secondary_muscles ?? [];
  const difficultyLabel = DIFFICULTY_LABEL[e.difficulty] ?? e.difficulty;

  return (
    <View style={exStyles.root}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView edges={["top"]}>
        <View style={progStyles.header}>
          <Pressable
            style={progStyles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </Pressable>
          <AppText variant="titleSmall" style={progStyles.headerTitle}>
            Exercise
          </AppText>
          <View style={progStyles.backButton} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={[exStyles.detailContent, { paddingBottom: spacing["3xl"] + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={exStyles.cover}>
          {imgError || !e.image ? (
            <Dumbbell color={colors.textMuted} size={48} />
          ) : (
            <Image
              source={getExerciseImageSource(e.image)}
              style={exStyles.coverImg}
              contentFit="contain"
              transition={400}
              onError={() => setImgError(true)}
            />
          )}
        </View>

        <View style={{ gap: spacing.sm }}>
          <AppText variant="titleLarge">{e.title}</AppText>
          <AppText variant="bodyLarge" color="textSecondary">
            {e.category} exercise for {primary.join(", ").toLowerCase()}.
          </AppText>
        </View>

        <View style={exStyles.diffCard}>
          <View style={exStyles.diffIcon}>
            <LevelBars level={e.difficulty} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="caption" color="textSecondary">
              Difficulty
            </AppText>
            <AppText variant="titleSmall">{difficultyLabel}</AppText>
          </View>
          <AppText variant="bodyMedium" color="textSecondary">
            {LIFTER_NOTE[e.difficulty] ?? ""}
          </AppText>
        </View>

        {e.equipment?.length > 0 && (
          <View style={{ gap: spacing.md }}>
            <AppText variant="titleSmall">Equipment</AppText>
            <View style={exStyles.wrapRow}>
              {e.equipment.map((eq) => (
                <View key={eq} style={exStyles.equipTag}>
                  <AppText variant="labelLarge">{eq}</AppText>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ gap: spacing.md }}>
          <AppText variant="titleSmall">Muscles worked</AppText>
          <View style={{ gap: spacing.sm }}>
            <AppText variant="caption" color="textSecondary">
              Primary
            </AppText>
            <View style={exStyles.wrapRow}>
              {primary.map((m) => (
                <MuscleTag key={m} label={m} primary />
              ))}
            </View>
          </View>
          {secondary.length > 0 && (
            <View style={{ gap: spacing.sm }}>
              <AppText variant="caption" color="textSecondary">
                Secondary
              </AppText>
              <View style={exStyles.wrapRow}>
                {secondary.map((m) => (
                  <MuscleTag key={m} label={m} />
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={{ gap: spacing.md }}>
          <View style={exStyles.howHeader}>
            <AppText variant="titleSmall">How to</AppText>
            <AppText variant="labelMedium" color="textSecondary">
              {e.steps.length} steps
            </AppText>
          </View>
          <View style={exStyles.steps}>
            {e.steps.map((step, i) => (
              <View key={i} style={exStyles.stepRow}>
                <View style={exStyles.stepNum}>
                  <AppText variant="labelLarge" color="textOnAccent">
                    {i + 1}
                  </AppText>
                </View>
                <AppText variant="bodyLarge" style={{ flex: 1 }}>
                  {step}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export function WorkoutDetailScreen({ id }: { id: string }) {
  const workout = getProgram(id);
  const s = useWorkoutStore();
  const insets = useSafeAreaInsets();
  const access = usePremiumAccess();
  const locked = workout ? access.isPreparedWorkoutLocked(programIndex(workout.id), workout.id) : false;
  // Where ads run, a locked workout shows the unlock options first and the paywall opens only when the
  // user picks Premium. Without ads there is nothing else to offer, so it opens straight away, as before.
  const [paywallReason, setPaywallReason] = useState<PaywallReason | null>(
    locked && !ADS_SUPPORTED ? "prepared_workout" : null,
  );
  const rewardedStatus = useRewardedStatus();
  const [adBusy, setAdBusy] = useState(false);
  const [adMessage, setAdMessage] = useState<string | null>(null);

  // Keep a rewarded ad loading whenever the unlock options are on screen.
  useEffect(() => {
    if (locked) preloadRewarded();
  }, [locked]);

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

  // Free users can't open prepared workouts beyond the first few, even via a direct link. They can unlock
  // one by watching a rewarded ad (shown only after they tap the button) or by going Premium.
  if (locked) {
    const adLoading = rewardedStatus === "idle" || rewardedStatus === "loading";
    const watchDisabled = adBusy || adLoading;
    const watchLabel = adBusy
      ? "Opening ad…"
      : adLoading
        ? "Loading ad…"
        : rewardedStatus === "unavailable"
          ? "Ad unavailable. Tap to retry"
          : "Watch an ad to unlock this workout";
    const unlockHours = Math.round(REWARDED_UNLOCK_MS / (60 * 60 * 1000));

    const handleWatchAd = async () => {
      if (adBusy) return;
      setAdMessage(null);
      if (rewardedStatus === "unavailable") return preloadRewarded(); // retry loading
      setAdBusy(true);
      const result = await showRewardedForWorkout(workout.id);
      setAdBusy(false);
      // "earned": the unlock is already stored, so `locked` flips and this screen becomes the workout.
      if (result === "not_earned") setAdMessage("Watch the whole ad to unlock this workout.");
      if (result === "unavailable") setAdMessage("No ad is available right now. Please try again in a moment.");
    };

    return (
      <View style={detailStyles.notFound}>
        <Lock color={theme.neon} size={48} />
        <Text style={detailStyles.notFoundText}>{workout.title} is a Premium workout</Text>
        {ADS_SUPPORTED && (
          <View style={detailStyles.unlockAdWrap}>
            <Pressable
              onPress={handleWatchAd}
              disabled={watchDisabled}
              accessibilityRole="button"
              accessibilityState={{ disabled: watchDisabled, busy: watchDisabled }}
              style={[detailStyles.unlockAdBtn, watchDisabled && { opacity: 0.55 }]}
            >
              {watchDisabled ? (
                <ActivityIndicator size="small" color={theme.background} />
              ) : (
                <Play size={16} color={theme.background} />
              )}
              <Text style={detailStyles.unlockAdBtnText}>{watchLabel}</Text>
            </Pressable>
            <Text style={detailStyles.unlockAdNote}>{adMessage ?? `Free for ${unlockHours} hours`}</Text>
          </View>
        )}
        <Pressable onPress={() => setPaywallReason("prepared_workout")}>
          <Text style={{ color: theme.neon, marginTop: 20, fontWeight: "800" }}>Unlock with Premium</Text>
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: theme.muted, marginTop: 16 }}>Go Back</Text>
        </Pressable>
        <PremiumPopup
          visible={paywallReason !== null}
          reason={paywallReason ?? undefined}
          onClose={() => setPaywallReason(null)}
        />
      </View>
    );
  }

  const handleEnroll = () => {
    if (!access.canCreatePlan) return setPaywallReason("plan_limit");

    const days: DayPlan[] = Array.from({ length: 7 }, (_, dayIndex) => {
      const programDay = workout.days[workout.recommendedDays.indexOf(dayIndex)];
      return programDay
        ? { dayIndex, label: programDay.label, isRest: false, exercises: buildDayExercises(programDay) }
        : { dayIndex, label: "Rest", isRest: true, exercises: [] };
    });

    const planId = Math.random().toString(36).slice(2);
    const added = s.addPlan({
      id: planId,
      name: workout.title,
      weekNumber: 1,
      totalWeeks: workout.programLength,
      phaseName: workout.category,
      days,
    });
    if (!added) return setPaywallReason("plan_limit");
    s.setActivePlan(planId);
    Alert.alert("Enrolled", `You have successfully enrolled in ${workout.title}!`);
    router.replace("/" as any);
  };

  return (
    <View style={progStyles.root}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView edges={["top"]}>
        <View style={progStyles.header}>
          <Pressable
            style={progStyles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </Pressable>
          <AppText variant="titleSmall" style={progStyles.headerTitle}>
            Program
          </AppText>
          <View style={progStyles.backButton} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={[progStyles.content, { paddingBottom: 96 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover: images are added later, until then an inset placeholder. */}
        <View style={progStyles.cover}>
          <View style={progStyles.coverBadge}>
            <Dumbbell size={16} color={colors.accent} />
            <AppText variant="labelMedium">{workout.equipment}</AppText>
          </View>
          <Dumbbell size={48} color={colors.textMuted} />
        </View>

        <View style={{ gap: spacing.sm }}>
          <AppText variant="titleLarge">{toTitleCase(workout.title)}</AppText>
          <AppText variant="bodyLarge" color="textSecondary">
            {workout.description}
          </AppText>
        </View>

        <View style={progStyles.infoCard}>
          <View style={progStyles.infoRow}>
            <View style={progStyles.infoIcon}>
              <LevelBars level={workout.level} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="caption" color="textSecondary">
                Level
              </AppText>
              <AppText variant="titleSmall">{workout.level}</AppText>
            </View>
          </View>
          <View style={progStyles.divider} />
          <View style={progStyles.infoRow}>
            <View style={progStyles.infoIcon}>
              <Dumbbell size={18} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="caption" color="textSecondary">
                Equipment
              </AppText>
              <AppText variant="titleSmall">{workout.equipment}</AppText>
            </View>
            <AppText variant="bodyMedium" color="textSecondary" numberOfLines={2} style={progStyles.equipmentList}>
              {programEquipment(workout).join(" · ")}
            </AppText>
          </View>
        </View>

        <View style={progStyles.statsRow}>
          <StatCard
            icon={<Calendar size={20} color={colors.accent} />}
            value={String(workout.programLength)}
            unit="weeks"
            label="Length"
          />
          <StatCard
            icon={<CalendarCheck size={20} color={colors.accent} />}
            value={String(workout.days.length)}
            unit="days"
            label="Days / week"
          />
          <StatCard
            icon={<Clock size={20} color={colors.accent} />}
            value={String(programMinutes(workout))}
            unit="min"
            label="Per workout"
          />
        </View>

        <View style={{ gap: spacing.md }}>
          <AppText variant="titleSmall">Recommended days</AppText>
          <View style={progStyles.weekRow}>
            {WEEK_ORDER.map((dayIndex) => {
              const on = workout.recommendedDays.includes(dayIndex);
              return (
                <View
                  key={dayIndex}
                  style={[progStyles.weekPill, { backgroundColor: on ? colors.accent : colors.bgSurface }]}
                >
                  <AppText variant="labelMedium" color={on ? "textOnAccent" : "textSecondary"}>
                    {WEEKDAY_LABELS[dayIndex]}
                  </AppText>
                </View>
              );
            })}
          </View>
        </View>

        <View style={progStyles.planHeader}>
          <AppText variant="titleSmall">Workout plan</AppText>
          <AppText variant="labelMedium" color="textSecondary">
            {workout.days.length} days
          </AppText>
        </View>

        {workout.days.map((day, dayIdx) => (
          <View key={`${day.label}-${dayIdx}`} style={progStyles.dayCard}>
            <View style={progStyles.dayHeader}>
              <View style={progStyles.dayNumber}>
                <AppText variant="titleSmall" color="textOnAccent">
                  {dayIdx + 1}
                </AppText>
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="titleSmall">{day.label}</AppText>
                <AppText variant="bodyMedium" color="textSecondary" numberOfLines={1}>
                  {day.muscles}
                </AppText>
              </View>
              <AppText variant="labelMedium" color="textSecondary">
                {dayMinutes(workout, day)} min
              </AppText>
            </View>
            <View style={progStyles.divider} />
            {buildDayExercises(day).map((item) => (
              <Pressable
                key={item.instanceId}
                style={progStyles.exerciseRow}
                onPress={() => router.push(`/exercise/${item.exerciseId}` as any)}
                accessibilityRole="button"
              >
                <View style={progStyles.exerciseThumb}>
                  {item.gif ? (
                    <Image source={getExerciseImageSource(item.gif)} style={progStyles.exerciseThumbImg} contentFit="cover" />
                  ) : (
                    <Dumbbell size={20} color={colors.textMuted} />
                  )}
                </View>
                <AppText variant="labelLarge" numberOfLines={1} style={{ flex: 1 }}>
                  {item.title}
                </AppText>
                <AppText variant="bodyMedium" color="textSecondary">
                  {item.sets} × {item.reps}
                </AppText>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={[progStyles.cta, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <Button label="Start program" onPress={handleEnroll} />
      </View>

      <PremiumPopup
        visible={paywallReason !== null}
        reason={paywallReason ?? undefined}
        onClose={() => setPaywallReason(null)}
      />
    </View>
  );
}

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const progStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgApp },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { flex: 1, textAlign: "center" },
  content: { paddingHorizontal: spacing.xl, gap: spacing["2xl"] },
  cover: {
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  coverBadge: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    height: 28,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.bgInset,
  },
  infoCard: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  infoRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.bgInset,
    alignItems: "center",
    justifyContent: "center",
  },
  equipmentList: { flexShrink: 1, maxWidth: "45%", textAlign: "right" },
  divider: { height: 1, backgroundColor: colors.bgInset },
  statsRow: { flexDirection: "row", gap: spacing.sm },
  weekRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.xs },
  weekPill: { flex: 1, height: 64, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  planHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dayCard: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  dayHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  dayNumber: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  exerciseThumb: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bgInset,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  exerciseThumbImg: { width: 44, height: 44 },
  cta: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.bgApp,
  },
});

/* ================================================================
 *  STYLES
 * ================================================================ */

const styles = StyleSheet.create({
  /* -- Calendar Modal -- */
  calendarModalContent: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: theme.border,
  },
  calendarTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: "900",
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8,253,142,0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  streakText: {
    color: theme.neon,
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  calendarDayHeader: {
    color: theme.muted,
    fontWeight: '700',
    width: 32,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarCell: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 18,
  },
  calendarCellWorkedOut: {
    backgroundColor: 'rgba(8,253,142,0.2)',
    borderWidth: 1,
    borderColor: theme.neon,
  },
  calendarCellText: {
    color: theme.text,
    fontWeight: '500',
  },
  calendarCellTextWorkedOut: {
    color: theme.neon,
    fontWeight: '800',
  },
  calendarCellTextToday: {
    color: '#fff',
    textDecorationLine: 'underline',
  },

  /* -- Shared -- */
  page: {
    flexGrow: 1,
    backgroundColor: theme.background,
    padding: 20,
    gap: 14,
  },
  scrollContent: {
    paddingBottom: 110, // clears the floating tab bar
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

  /* -- Week label -- */

  /* -- Today section -- */

  /* -- Rest day card -- */

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

  /* -- CTA Button -- */

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
  restProgressTrack: {
    position: "absolute",
    left: 48,
    right: 48,
    bottom: 38,
    height: 4,
    overflow: "hidden",
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  restProgressFill: {
    flex: 1,
    backgroundColor: theme.neon,
    borderRadius: 2,
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
});

/* ================================================================
 *  EXERCISE DETAIL — dedicated styles
 * ================================================================ */
const detailStyles = StyleSheet.create({

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

  /* Locked workout: "Watch an ad to unlock" */
  unlockAdWrap: {
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 24,
  },
  unlockAdBtn: {
    backgroundColor: theme.neon,
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  unlockAdBtnText: {
    color: theme.background,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  unlockAdNote: {
    color: theme.muted,
    fontSize: 13,
    textAlign: "center",
  },

  /* Header */

  /* Scroll body */

  /* Title */

  /* Meta */

  /* GIF / image card */

  /* Equipment pills */

  /* HOW TO header */

  /* Steps */

  /* CTA */
});

/* ================================================================
 *  BUILDER SCREEN — Exercise Library styles
 * ================================================================ */
const exStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgApp },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: 120, gap: spacing.md },
  headerBlock: { gap: spacing.md, paddingBottom: spacing.xs },
  legend: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  legendItem: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  empty: { alignItems: "center", gap: spacing.sm, paddingTop: spacing["3xl"] },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  thumb: {
    width: 84,
    height: 84,
    borderRadius: radius.md,
    backgroundColor: colors.bgInset,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbImg: { width: 84, height: 84 },
  cardBody: { flex: 1, gap: spacing.sm },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    height: 28,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.bgInset,
  },
  tagDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  diffCircle: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.bgInset,
    alignItems: "center",
    justifyContent: "center",
  },

  detailContent: { paddingHorizontal: spacing.xl, gap: spacing["2xl"] },
  cover: {
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: colors.bgSurface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  coverImg: { width: "100%", height: "100%" },
  diffCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  diffIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.bgInset,
    alignItems: "center",
    justifyContent: "center",
  },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  equipTag: {
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSurface,
    justifyContent: "center",
  },
  muscleTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
  },
  howHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  steps: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.lg },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.lg },
  stepNum: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
