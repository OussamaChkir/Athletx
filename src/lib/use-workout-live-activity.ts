import { useEffect } from "react";
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

  useEffect(() => {
    if (livePhase === "done" || !sessionStartedAt || !exercise) {
      syncWorkoutActivity(null);
      return;
    }
    const resting = livePhase === "rest";
    syncWorkoutActivity({
      workoutName,
      exerciseTitle: exercise.title,
      // While resting, `exercise` is already the next lift or the next set of the same one.
      detail: resting
        ? liveSet === 1
          ? `Next · ${exercise.sets} sets × ${exercise.reps} reps`
          : `Next · Set ${liveSet} of ${exercise.sets}`
        : `Set ${liveSet} of ${exercise.sets} · ${exercise.reps} reps`,
      phase: resting && restEndsAt ? "rest" : "exercise",
      startedAt: new Date(sessionStartedAt).getTime(),
      restEndsAt: restEndsAt ?? 0,
    });
  }, [livePhase, liveIndex, liveSet, restEndsAt, sessionStartedAt, workoutName, exercise]);

  // Leaving the live screen means the workout is over (finished or cancelled).
  useEffect(() => () => syncWorkoutActivity(null), []);
}
