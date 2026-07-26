"use client";

import { motion } from "framer-motion";
import { MUSCLES, MUSCLE_COLORS } from "@/lib/constants";
import { getMuscleCounts } from "@/lib/exercises";
import type { MuscleId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useWorkoutStore } from "@/store/workout-store";

export function MuscleSelector() {
  const muscles = useWorkoutStore((s) => s.muscles);
  const equipment = useWorkoutStore((s) => s.equipment);
  const toggleMuscle = useWorkoutStore((s) => s.toggleMuscle);
  const counts = getMuscleCounts(equipment);
  const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));

  const groups = [
    { key: "upper", label: "Upper Body" },
    { key: "core", label: "Core" },
    { key: "lower", label: "Lower Body" },
  ] as const;

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.key}>
          <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {group.label}
          </h3>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {MUSCLES.filter((m) => m.group === group.key).map((muscle, i) => {
              const selected = muscles.includes(muscle.id);
              const count =
                countMap[muscle.id] ??
                counts
                  .filter((c) => c._id.includes(muscle.id))
                  .reduce((a, c) => a + c.count, 0);
              const color = MUSCLE_COLORS[muscle.id] ?? "#39ff14";

              return (
                <motion.button
                  key={muscle.id}
                  type="button"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleMuscle(muscle.id as MuscleId)}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border px-3 py-3.5 text-left transition-all",
                    selected
                      ? "border-transparent shadow-[0_0_20px_rgb(0_0_0_/0.3)]"
                      : "border-white/8 bg-card/50 hover:border-white/14"
                  )}
                  style={
                    selected
                      ? {
                          background: `linear-gradient(135deg, ${color}33, ${color}14)`,
                          borderColor: `${color}66`,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{muscle.label}</span>
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {count} exercise{count === 1 ? "" : "s"}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
