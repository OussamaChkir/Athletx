/** Lock-screen workout tracker. Only iOS has Live Activities; every other platform gets this no-op (see live-activity.ios.ts). */
export type WorkoutActivityState = {
  workoutName: string;
  exerciseTitle: string;
  detail: string;
  /** Translated header line of the card ("ATHLETX" or "ATHLETX · REST"). */
  header: string;
  phase: "exercise" | "rest";
  startedAt: number;
  restEndsAt: number;
};

/** Show or refresh the activity for a running workout, or pass null to remove it. */
export function syncWorkoutActivity(_state: WorkoutActivityState | null): void {}
