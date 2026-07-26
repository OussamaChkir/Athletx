"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MUSCLE_COLORS } from "@/lib/constants";
import { createWorkoutExercise } from "@/lib/exercises";
import type { Exercise } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useWorkoutStore } from "@/store/workout-store";
import { toast } from "sonner";

export function ExerciseCard({
  exercise,
  compact = false,
}: {
  exercise: Exercise;
  compact?: boolean;
}) {
  const [failedVideo, setFailedVideo] = useState(false);
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const focus = useWorkoutStore((s) => s.focus);
  const mainMuscle = exercise.mainMuscle ?? exercise.targets[0];
  const color = MUSCLE_COLORS[mainMuscle] ?? "#39ff14";
  const video = exercise.videos?.[0];

  const onAdd = () => {
    addExercise(createWorkoutExercise(exercise, focus));
    toast.success(`Added ${exercise.title}`);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "overflow-hidden rounded-2xl border border-white/8 bg-card/70",
        compact ? "flex gap-3 p-2" : "flex flex-col"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-black/40",
          compact ? "h-20 w-24 shrink-0 rounded-xl" : "aspect-video"
        )}
      >
        {video && !failedVideo ? (
          <video
            src={video}
            muted
            loop
            playsInline
            autoPlay
            onError={() => setFailedVideo(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary">
            <Play className="size-8 text-muted-foreground" />
          </div>
        )}
        <div
          className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
          style={{ background: `${color}cc` }}
        >
          {mainMuscle}
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col", compact ? "py-1 pr-1" : "p-3.5")}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/exercise/${exercise._id}`}
              className="font-display text-base font-semibold leading-tight hover:text-primary"
            >
              {exercise.title}
            </Link>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-[10px]">
                {exercise.difficulty}
              </Badge>
              {exercise.equipment.slice(0, 2).map((eq) => (
                <Badge key={eq} variant="outline" className="text-[10px] capitalize">
                  {eq === "none" ? "bodyweight" : eq}
                </Badge>
              ))}
            </div>
          </div>
          {!compact && (
            <Button
              size="icon"
              variant="secondary"
              className="size-9 shrink-0 rounded-full bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={onAdd}
              aria-label="Add to workout"
            >
              <Plus className="size-4" />
            </Button>
          )}
        </div>
        {!compact && exercise.steps?.[0] && (
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
            {exercise.steps[0]}
          </p>
        )}
        {compact && (
          <Button size="sm" variant="ghost" className="mt-auto h-8 self-start px-2 text-primary" onClick={onAdd}>
            <Plus className="mr-1 size-3.5" /> Add
          </Button>
        )}
      </div>
    </motion.article>
  );
}

export function EquipmentIcon({ id }: { id: string }) {
  const known = [
    "none",
    "dumbbell",
    "barbell",
    "kettlebell",
    "band",
    "plate",
    "pull-up-bar",
    "bench",
  ];
  if (!known.includes(id)) return null;
  return (
    <Image
      src={`/equipment/${id}.png`}
      alt={id}
      width={28}
      height={22}
      className="object-contain opacity-80"
    />
  );
}
