import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CompletePhase } from "@/components/workout/CompletePhase";
import { ExercisePhase } from "@/components/workout/ExercisePhase";
import { RestPhase } from "@/components/workout/RestPhase";
import { LiveHeader } from "@/components/workout/shared";
import {
  isMeaningfulSession,
  preloadInterstitial,
  showInterstitialThen,
} from "@/lib/ads";
import { detectRecords, lastLoggedSet } from "@/lib/progress";
import { colors } from "@/lib/theme";
import { useWeightUnit } from "@/lib/units";
import type { HistoryExercise } from "@/lib/types";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useWorkoutStore } from "@/store/workout-store";

/** Live workout: logging a set, resting between sets, and the summary once the last set is done. */
export function LiveScreen() {
  const router = useRouter();
  const s = useWorkoutStore();
  const tickRest = useWorkoutStore((st) => st.tickRest);
  const [elapsed, setElapsed] = useState(0);
  const unit = useWeightUnit();
  const setWeightUnit = useOnboardingStore((st) => st.setWeightUnit);

  const ex = s.currentWorkout[s.liveIndex];

  // Workout clock and rest countdown share one timer.
  useEffect(() => {
    if (s.livePhase === "done" || !s.sessionStartedAt) return;
    const startedAt = new Date(s.sessionStartedAt).getTime();
    const update = () => setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    update();
    const id = setInterval(() => {
      update();
      tickRest();
    }, 1000);
    return () => clearInterval(id);
  }, [s.livePhase, s.sessionStartedAt, tickRest]);

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

  const goHome = () => router.replace("/" as never);

  const confirmEnd = () => {
    Alert.alert("End Workout Early?", "Your progress will not be saved.", [
      { text: "Keep Going", style: "cancel" },
      {
        text: "End Workout",
        style: "destructive",
        onPress: () => {
          const loggedSets = useWorkoutStore.getState().currentWorkout.reduce((n, e) => n + e.loggedSets.length, 0);
          const worthAnAd = isMeaningfulSession(loggedSets, elapsed);
          s.cancelWorkout();
          // Only after real effort in the session; if no ad is ready the user just leaves.
          if (worthAnAd) showInterstitialThen("workout_exit", goHome);
          else goHome();
        },
      },
    ]);
  };

  // Records compare against workouts finished before this session started.
  const summary = useMemo(() => {
    if (s.livePhase !== "done") return null;
    const exercises: HistoryExercise[] = s.currentWorkout
      .filter((e) => e.loggedSets.length > 0)
      .map((e) => ({
        exerciseId: e.exerciseId,
        title: e.title,
        mainMuscle: e.mainMuscle,
        sets: e.loggedSets.map((l) => ({ reps: l.reps, weight: l.weight })),
      }));
    const startedAt = s.sessionStartedAt ?? "";
    const before = s.history.filter((h) => h.completedAt < startedAt);
    const volumeKg = s.currentWorkout.reduce(
      (sum, e) => sum + e.loggedSets.reduce((n, l) => n + (l.weight ? l.weight * l.reps : 0), 0),
      0
    );
    const totalSets = s.currentWorkout.reduce((n, e) => n + e.loggedSets.length, 0);
    return { exercises, records: detectRecords(exercises, before), volumeKg, totalSets };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.livePhase]);

  if (!ex && s.livePhase !== "done") return null;

  if (s.livePhase === "done" && summary) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgApp }}>
        <SafeAreaView style={{ flex: 1 }}>
          <CompletePhase
            workoutName={s.workoutName}
            elapsed={elapsed}
            volumeKg={summary.volumeKg}
            totalSets={summary.totalSets}
            exercises={summary.exercises}
            records={summary.records}
            unit={unit}
            // The workout was saved when this screen appeared, so an ad here can't cost the user data.
            onDone={() => showInterstitialThen("workout_complete", goHome)}
          />
        </SafeAreaView>
      </View>
    );
  }

  if (!ex) return null;

  // completeSet already moved on, so `ex` is what comes after the rest: the next set or the next lift.
  const nextTitle = ex;

  const lastTime = lastLoggedSet(
    s.history.filter((h) => !s.sessionStartedAt || h.completedAt < s.sessionStartedAt),
    ex.exerciseId
  );
  const startWeightKg = [...ex.loggedSets].reverse().find((l) => l.weight)?.weight ?? lastTime?.weight;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgApp }}>
      <SafeAreaView style={{ flex: 1 }}>
        <LiveHeader elapsed={elapsed} onClose={confirmEnd} />
        {s.livePhase === "rest" ? (
          <RestPhase
            // A fresh rest starts every time the logged-set count changes.
            key={`rest-${s.liveIndex}-${s.liveSet}`}
            remaining={s.restRemaining}
            onAdd={s.addRestTime}
            onReduce={s.reduceRestTime}
            onSkip={s.skipRest}
            next={{
              label: s.liveSet === 1 ? "NEXT EXERCISE" : "NEXT SET",
              title: nextTitle.title,
              detail:
                s.liveSet === 1
                  ? `${nextTitle.sets} sets × ${nextTitle.reps} reps`
                  : `Set ${s.liveSet} of ${nextTitle.sets}`,
              image: nextTitle.gif,
            }}
          />
        ) : (
          <ExercisePhase
            key={`ex-${s.liveIndex}-${s.liveSet}`}
            exercise={ex}
            index={s.liveIndex}
            total={s.currentWorkout.length}
            set={s.liveSet}
            unit={unit}
            onToggleUnit={() => setWeightUnit(unit === "kg" ? "lb" : "kg")}
            startWeightKg={startWeightKg}
            lastTime={lastTime}
            onComplete={(reps, weightKg) => s.completeSet(reps, weightKg)}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
