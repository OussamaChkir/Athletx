import { useEffect } from "react";
import i18n, { useLanguage } from "@/i18n";
import { exerciseTitle } from "@/lib/exercise-i18n";
import { syncWorkoutActivity } from "@/lib/live-activity";
import { useWorkoutStore } from "@/store/workout-store";

/**
 * Mirrors the running workout onto the lock screen (iOS Live Activity): current set while lifting,
 * a countdown while resting. Removes it when the workout ends or this screen goes away.
 */
export function useWorkoutLiveActivity() {
  const livePhase = useWorkoutStore((s) => s.livePhase);
  const liveIndex = useWorkoutStore((s) => s.liveIndex);
  const liveSet = useWorkoutStore((s) => s.liveSet);
  const restEndsAt = useWorkoutStore((s) => s.restEndsAt);
  const sessionStartedAt = useWorkoutStore((s) => s.sessionStartedAt);
  const workoutName = useWorkoutStore((s) => s.workoutName);
  const exercise = useWorkoutStore((s) => s.currentWorkout[s.liveIndex]);
  // The card text is translated here (the widget cannot), so refresh it when the language changes.
  const language = useLanguage();

  useEffect(() => {
    if (livePhase === "done" || !sessionStartedAt || !exercise) {
      syncWorkoutActivity(null);
      return;
    }
    const resting = livePhase === "rest";
    const showRest = resting && !!restEndsAt;
    const t = i18n.getFixedT(language);
    syncWorkoutActivity({
      workoutName,
      exerciseTitle: exerciseTitle(exercise.exerciseId, exercise.title),
      // While resting, `exercise` is already the next lift or the next set of the same one.
      detail: resting
        ? liveSet === 1
          ? t("workout:liveActivity.nextExercise", { count: exercise.sets, reps: exercise.reps })
          : t("workout:liveActivity.nextSet", { set: liveSet, total: exercise.sets })
        : t("workout:liveActivity.current", { set: liveSet, total: exercise.sets, reps: exercise.reps }),
      header: showRest ? t("workout:liveActivity.restHeader") : "ATHLETX",
      phase: showRest ? "rest" : "exercise",
      startedAt: new Date(sessionStartedAt).getTime(),
      restEndsAt: restEndsAt ?? 0,
    });
  }, [livePhase, liveIndex, liveSet, restEndsAt, sessionStartedAt, workoutName, exercise, language]);

  // Leaving the live screen means the workout is over (finished or cancelled).
  useEffect(() => () => syncWorkoutActivity(null), []);
}
