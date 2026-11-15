import WorkoutActivity from "@/live-activity/WorkoutActivity";
import type { WorkoutActivityState } from "./live-activity";

export type { WorkoutActivityState };

/**
 * Show or refresh the lock-screen card for a running workout, or pass null to remove it.
 *
 * Stateless on purpose: it looks the running activity up each time, so it also adopts or cleans up an
 * activity left over from an earlier launch. Never throws: Live Activities can be switched off by the
 * user, unsupported on the device, or missing from a build without the native module.
 */
export function syncWorkoutActivity(state: WorkoutActivityState | null): void {
  try {
    const running = WorkoutActivity.getInstances();

    if (!state) {
      for (const instance of running) void instance.end("immediate").catch(() => {});
      return;
    }

    const props = { ...state, updatedAt: Date.now() };
    const [current, ...extras] = running;
    for (const instance of extras) void instance.end("immediate").catch(() => {});

    if (current) void current.update(props).catch(() => {});
    else WorkoutActivity.start(props, "athletx://live");
  } catch {
    // Live Activities are a bonus; the workout itself must never depend on them.
  }
}
