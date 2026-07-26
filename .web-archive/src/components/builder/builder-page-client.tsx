"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Save, Share2 } from "lucide-react";
import { toast } from "sonner";
import { WorkoutBuilder } from "@/components/builder/workout-builder";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWorkoutStore } from "@/store/workout-store";

export function BuilderPageClient() {
  const router = useRouter();
  const currentWorkout = useWorkoutStore((s) => s.currentWorkout);
  const saveCurrentWorkout = useWorkoutStore((s) => s.saveCurrentWorkout);
  const startLiveSession = useWorkoutStore((s) => s.startLiveSession);
  const workoutName = useWorkoutStore((s) => s.workoutName);

  const onSave = () => {
    if (!currentWorkout.length) {
      toast.error("Add exercises first");
      return;
    }
    saveCurrentWorkout();
    toast.success("Workout saved locally");
  };

  const onShare = async () => {
    const payload = {
      name: workoutName,
      exercises: currentWorkout.map((e) => ({
        title: e.title,
        sets: e.sets,
        reps: e.reps,
        rest: e.restSeconds,
      })),
    };
    const text = `${payload.name}\n\n${payload.exercises
      .map(
        (e, i) =>
          `${i + 1}. ${e.title} — ${e.sets}×${e.reps} (${e.rest}s rest)`
      )
      .join("\n")}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: workoutName, text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Copied workout to clipboard");
      }
    } catch {
      await navigator.clipboard.writeText(text);
      toast.success("Copied workout to clipboard");
    }
  };

  const onStart = () => {
    if (!currentWorkout.length) {
      toast.error("Build a workout first");
      return;
    }
    startLiveSession();
    router.push("/live");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Builder</h1>
          <p className="text-sm text-muted-foreground">
            Drag to reorder · tweak sets & rest
          </p>
        </div>
        <Link
          href="/library"
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
        >
          Add more
        </Link>
      </div>

      <WorkoutBuilder />

      {currentWorkout.length > 0 && (
        <div className="sticky bottom-[5.5rem] z-30 grid grid-cols-3 gap-2 rounded-2xl border border-primary/20 bg-background/90 p-2 backdrop-blur-xl">
          <Button variant="secondary" className="h-11" onClick={onSave}>
            <Save className="mr-1.5 size-4" /> Save
          </Button>
          <Button variant="secondary" className="h-11" onClick={onShare}>
            <Share2 className="mr-1.5 size-4" /> Share
          </Button>
          <Button
            className="h-11 shadow-[0_0_20px_rgb(57_255_20_/0.25)]"
            onClick={onStart}
          >
            <Play className="mr-1.5 size-4" /> Start
          </Button>
        </div>
      )}
    </div>
  );
}
