"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Flame, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStreak, useWorkoutStore } from "@/store/workout-store";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function HistoryView() {
  const history = useWorkoutStore((s) => s.history);
  const savedWorkouts = useWorkoutStore((s) => s.savedWorkouts);
  const deleteSavedWorkout = useWorkoutStore((s) => s.deleteSavedWorkout);
  const loadWorkout = useWorkoutStore((s) => s.loadWorkout);
  const streak = useStreak();

  const totalSets = history.reduce((a, h) => a + h.totalSets, 0);
  const totalSessions = history.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">History</h1>
        <p className="text-sm text-muted-foreground">
          Streaks, volume, and saved routines.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="glass rounded-2xl p-3 text-center">
          <Flame className="mx-auto size-4 text-ember" />
          <p className="mt-1 font-display text-xl font-bold">{streak}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Day streak
          </p>
        </div>
        <div className="glass rounded-2xl p-3 text-center">
          <p className="font-display text-xl font-bold text-primary">
            {totalSessions}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Sessions
          </p>
        </div>
        <div className="glass rounded-2xl p-3 text-center">
          <p className="font-display text-xl font-bold">{totalSets}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Sets logged
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Recent sessions</h2>
        {!history.length && (
          <div className="glass rounded-2xl px-4 py-10 text-center text-sm text-muted-foreground">
            Complete a live workout to start tracking.
          </div>
        )}
        {history.map((entry) => (
          <article
            key={entry.id}
            className="glass rounded-2xl px-4 py-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{entry.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(entry.completedAt), {
                    addSuffix: true,
                  })}{" "}
                  · {entry.exerciseCount} moves · {entry.totalSets} sets
                </p>
                {entry.durationSeconds > 0 && (
                  <p className="mt-1 text-xs text-primary">
                    {formatDuration(entry.durationSeconds)}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap justify-end gap-1">
                {entry.muscles.slice(0, 3).map((m) => (
                  <span
                    key={m}
                    className="rounded-full bg-secondary px-2 py-0.5 text-[10px]"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Saved workouts</h2>
        {!savedWorkouts.length && (
          <div className="glass rounded-2xl px-4 py-8 text-center text-sm text-muted-foreground">
            Save from the builder to reuse later.
          </div>
        )}
        {savedWorkouts.map((w) => (
          <div
            key={w.id}
            className="glass flex items-center gap-3 rounded-2xl px-3 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{w.name}</p>
              <p className="text-xs text-muted-foreground">
                {w.exercises.length} exercises · {w.focus}
              </p>
            </div>
            <Link
              href="/builder"
              onClick={() => loadWorkout(w.id)}
              className="inline-flex h-7 items-center rounded-lg bg-secondary px-2.5 text-[0.8rem] font-medium text-secondary-foreground"
            >
              Load
            </Link>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => deleteSavedWorkout(w.id)}
              aria-label="Delete saved workout"
            >
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
}
