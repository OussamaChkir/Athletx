"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { ExerciseCard } from "@/components/exercises/exercise-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MUSCLES } from "@/lib/constants";
import { filterExercises } from "@/lib/exercises";
import { cn } from "@/lib/utils";
import { useWorkoutStore } from "@/store/workout-store";

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;

export function ExerciseLibrary() {
  const equipment = useWorkoutStore((s) => s.equipment);
  const [search, setSearch] = useState("");
  const [muscles, setMuscles] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [useMyGear, setUseMyGear] = useState(true);

  const results = useMemo(
    () =>
      filterExercises({
        search,
        muscles,
        difficulties,
        equipment: useMyGear ? equipment : undefined,
        includeExcluded: true,
      }),
    [search, muscles, difficulties, useMyGear, equipment]
  );

  const toggle = (
    list: string[],
    value: string,
    setter: (v: string[]) => void
  ) => {
    setter(
      list.includes(value) ? list.filter((x) => x !== value) : [...list, value]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="h-11 bg-card/60 pl-10"
          />
        </div>
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="secondary" size="icon" className="size-11 shrink-0">
                <SlidersHorizontal className="size-4" />
              </Button>
            }
          />
          <SheetContent side="bottom" className="max-h-[80dvh] overflow-y-auto rounded-t-3xl">
            <SheetHeader>
              <SheetTitle className="font-display">Filters</SheetTitle>
            </SheetHeader>
            <div className="space-y-5 px-1 pb-6">
              <label className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-card/50 px-3 py-3">
                <span className="text-sm">Only my equipment</span>
                <input
                  type="checkbox"
                  checked={useMyGear}
                  onChange={(e) => setUseMyGear(e.target.checked)}
                  className="size-4 accent-[var(--neon)]"
                />
              </label>
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                  Difficulty
                </p>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggle(difficulties, d, setDifficulties)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs",
                        difficulties.includes(d)
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-white/10"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                  Muscles
                </p>
                <div className="flex flex-wrap gap-2">
                  {MUSCLES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggle(muscles, m.id, setMuscles)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs",
                        muscles.includes(m.id)
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-white/10"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{results.length}</span>{" "}
          exercises
        </p>
        <div className="flex flex-wrap justify-end gap-1">
          {muscles.slice(0, 3).map((m) => (
            <Badge key={m} variant="secondary" className="text-[10px]">
              {m}
            </Badge>
          ))}
        </div>
      </div>

      <motion.div layout className="grid gap-3 sm:grid-cols-2">
        {results.slice(0, 60).map((exercise) => (
          <ExerciseCard key={exercise._id} exercise={exercise} />
        ))}
      </motion.div>
      {results.length > 60 && (
        <p className="pb-4 text-center text-xs text-muted-foreground">
          Showing 60 of {results.length}. Refine filters to narrow results.
        </p>
      )}
    </div>
  );
}
