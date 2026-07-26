"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Pause,
  SkipForward,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkoutStore } from "@/store/workout-store";

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function LiveWorkoutPlayer() {
  const router = useRouter();
  const currentWorkout = useWorkoutStore((s) => s.currentWorkout);
  const liveIndex = useWorkoutStore((s) => s.liveIndex);
  const livePhase = useWorkoutStore((s) => s.livePhase);
  const liveSet = useWorkoutStore((s) => s.liveSet);
  const restRemaining = useWorkoutStore((s) => s.restRemaining);
  const sessionStartedAt = useWorkoutStore((s) => s.sessionStartedAt);
  const completeSet = useWorkoutStore((s) => s.completeSet);
  const skipRest = useWorkoutStore((s) => s.skipRest);
  const tickRest = useWorkoutStore((s) => s.tickRest);
  const nextExercise = useWorkoutStore((s) => s.nextExercise);
  const prevExercise = useWorkoutStore((s) => s.prevExercise);
  const finishWorkout = useWorkoutStore((s) => s.finishWorkout);
  const resetLive = useWorkoutStore((s) => s.resetLive);

  const exercise = currentWorkout[liveIndex];
  const progress = useMemo(() => {
    if (!currentWorkout.length) return 0;
    const done = currentWorkout.filter((e) => e.completed).length;
    const setProgress =
      exercise && !exercise.completed
        ? (liveSet - 1) / Math.max(exercise.sets, 1) / currentWorkout.length
        : 0;
    return Math.min(100, ((done / currentWorkout.length) + setProgress) * 100);
  }, [currentWorkout, exercise, liveSet]);

  useEffect(() => {
    if (livePhase !== "rest") return;
    const id = setInterval(() => tickRest(), 1000);
    return () => clearInterval(id);
  }, [livePhase, tickRest]);

  if (!currentWorkout.length) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-display text-2xl font-bold">No workout loaded</p>
        <Button render={<Link href="/" />} nativeButton={false}>
          Build one first
        </Button>
      </div>
    );
  }

  if (livePhase === "done" || !exercise) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex size-24 items-center justify-center rounded-full bg-primary/20 text-primary"
        >
          <Check className="size-12" strokeWidth={2.5} />
        </motion.div>
        <div>
          <h1 className="font-display text-3xl font-bold text-glow">Session complete</h1>
          <p className="mt-2 text-muted-foreground">
            {currentWorkout.length} exercises logged. Great work.
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-3">
          <Button
            size="lg"
            className="h-12"
            onClick={() => {
              const started = sessionStartedAt
                ? Date.now() - new Date(sessionStartedAt).getTime()
                : 0;
              finishWorkout(Math.round(started / 1000));
              resetLive();
              router.push("/history");
            }}
          >
            Save & view history
          </Button>
          <Button variant="secondary" render={<Link href="/" />} nativeButton={false}>
            Back home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#050807]">
      <div className="flex items-center justify-between px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => {
            resetLive();
            router.push("/builder");
          }}
        >
          <X className="size-5" />
        </Button>
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Exercise {liveIndex + 1} / {currentWorkout.length}
          </p>
          <p className="text-xs text-primary">Set {liveSet} / {exercise.sets}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          render={<Link href="/builder" />}
          nativeButton={false}
        >
          <Pause className="size-5" />
        </Button>
      </div>

      <div className="px-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden bg-black">
        {exercise.videos[0] ? (
          <video
            key={exercise.videos[0]}
            src={exercise.videos[0]}
            muted
            loop
            playsInline
            autoPlay
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No demo video
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050807] via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        <AnimatePresence mode="wait">
          {livePhase === "rest" ? (
            <motion.div
              key="rest"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-1 flex-col items-center justify-center text-center"
            >
              <p className="text-sm uppercase tracking-[0.2em] text-ember">Rest</p>
              <p className="mt-2 font-display text-7xl font-bold tabular-nums text-glow">
                {formatTime(restRemaining)}
              </p>
              <p className="mt-3 text-muted-foreground">Up next: set {liveSet}</p>
              <Button
                variant="secondary"
                className="mt-8"
                onClick={skipRest}
              >
                <SkipForward className="mr-2 size-4" /> Skip rest
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={exercise.instanceId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-1 flex-col"
            >
              <h1 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
                {exercise.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {exercise.mainMuscle} · {exercise.reps} reps · {exercise.restSeconds}s rest
              </p>
              {exercise.steps[0] && (
                <p className="mt-4 line-clamp-3 text-sm text-foreground/80">
                  {exercise.steps[0]}
                </p>
              )}

              <div className="mt-auto space-y-3 pt-8">
                <Button
                  size="lg"
                  className="h-14 w-full text-base font-semibold shadow-[0_0_28px_rgb(57_255_20_/0.35)]"
                  onClick={completeSet}
                >
                  Complete set {liveSet}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="h-11 flex-1"
                    onClick={prevExercise}
                    disabled={liveIndex === 0}
                  >
                    <ChevronLeft className="mr-1 size-4" /> Prev
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-11 flex-1"
                    onClick={nextExercise}
                    disabled={liveIndex >= currentWorkout.length - 1}
                  >
                    Next <ChevronRight className="ml-1 size-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
