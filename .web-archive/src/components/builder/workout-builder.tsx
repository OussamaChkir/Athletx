"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MUSCLE_COLORS } from "@/lib/constants";
import type { WorkoutExercise } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useWorkoutStore } from "@/store/workout-store";

function SortableRow({ exercise }: { exercise: WorkoutExercise }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: exercise.instanceId });
  const removeExercise = useWorkoutStore((s) => s.removeExercise);
  const updateExercise = useWorkoutStore((s) => s.updateExercise);
  const color = MUSCLE_COLORS[exercise.mainMuscle] ?? "#39ff14";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "glass flex items-stretch gap-2 rounded-2xl p-3",
        isDragging && "z-20 opacity-90 shadow-xl ring-1 ring-primary/40"
      )}
    >
      <button
        type="button"
        className="touch-target flex cursor-grab items-center text-muted-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
          />
          <p className="truncate font-display text-sm font-semibold">
            {exercise.title}
          </p>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {exercise.mainMuscle} · {exercise.difficulty}
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <label className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Sets
            </span>
            <Input
              type="number"
              min={1}
              max={10}
              value={exercise.sets}
              onChange={(e) =>
                updateExercise(exercise.instanceId, {
                  sets: Number(e.target.value) || 1,
                })
              }
              className="h-9 bg-background/50"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Reps
            </span>
            <Input
              type="number"
              min={1}
              max={50}
              value={exercise.reps}
              onChange={(e) =>
                updateExercise(exercise.instanceId, {
                  reps: Number(e.target.value) || 1,
                })
              }
              className="h-9 bg-background/50"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Rest (s)
            </span>
            <Input
              type="number"
              min={0}
              max={300}
              step={5}
              value={exercise.restSeconds}
              onChange={(e) =>
                updateExercise(exercise.instanceId, {
                  restSeconds: Number(e.target.value) || 0,
                })
              }
              className="h-9 bg-background/50"
            />
          </label>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => removeExercise(exercise.instanceId)}
        aria-label="Remove exercise"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function WorkoutBuilder() {
  const currentWorkout = useWorkoutStore((s) => s.currentWorkout);
  const reorderExercises = useWorkoutStore((s) => s.reorderExercises);
  const workoutName = useWorkoutStore((s) => s.workoutName);
  const setWorkoutName = useWorkoutStore((s) => s.setWorkoutName);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = currentWorkout.findIndex((e) => e.instanceId === active.id);
    const to = currentWorkout.findIndex((e) => e.instanceId === over.id);
    if (from >= 0 && to >= 0) reorderExercises(from, to);
  };

  if (!currentWorkout.length) {
    return (
      <div className="glass flex flex-col items-center justify-center rounded-3xl px-6 py-16 text-center">
        <p className="font-display text-xl font-semibold">Empty rack</p>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Generate a workout or add exercises from the library to start building.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        value={workoutName}
        onChange={(e) => setWorkoutName(e.target.value)}
        className="h-12 border-primary/20 bg-card/60 font-display text-lg font-semibold"
        placeholder="Workout name"
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={currentWorkout.map((e) => e.instanceId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {currentWorkout.map((exercise) => (
              <SortableRow key={exercise.instanceId} exercise={exercise} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
