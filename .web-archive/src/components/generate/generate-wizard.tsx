"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Dumbbell,
  Flame,
  Sparkles,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import { EquipmentSelector } from "@/components/equipment/equipment-selector";
import { MuscleSelector } from "@/components/muscles/muscle-selector";
import { Button, buttonVariants } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { FOCUS_PRESETS } from "@/lib/constants";
import type { WorkoutFocus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useStreak, useWorkoutStore } from "@/store/workout-store";

const STEPS = ["Equipment", "Muscles", "Dial in"] as const;

export function GenerateWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const equipment = useWorkoutStore((s) => s.equipment);
  const muscles = useWorkoutStore((s) => s.muscles);
  const focus = useWorkoutStore((s) => s.focus);
  const exerciseCount = useWorkoutStore((s) => s.exerciseCount);
  const setFocus = useWorkoutStore((s) => s.setFocus);
  const setExerciseCount = useWorkoutStore((s) => s.setExerciseCount);
  const generate = useWorkoutStore((s) => s.generate);
  const currentWorkout = useWorkoutStore((s) => s.currentWorkout);
  const history = useWorkoutStore((s) => s.history);
  const streak = useStreak();

  const canContinue =
    (step === 0 && equipment.length > 0) ||
    (step === 1 && muscles.length > 0) ||
    step === 2;

  const onGenerate = () => {
    const workout = generate();
    if (!workout.length) {
      toast.error("No exercises match. Try more equipment or muscles.");
      return;
    }
    toast.success(`Built ${workout.length}-move session`);
    router.push("/builder");
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/15 via-card to-ember/10 p-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            PulseFit
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Train smarter.
            <br />
            <span className="text-primary text-glow">Move better.</span>
          </h1>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Pick your gear and muscles — we build a balanced routine from 600+
            curated exercises.
          </p>
        </motion.div>
        <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 size-32 rounded-full bg-ember/20 blur-3xl" />
      </section>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Streak", value: `${streak}d`, icon: Flame },
          { label: "Sessions", value: String(history.length), icon: Timer },
          {
            label: "Ready",
            value: String(currentWorkout.length),
            icon: Dumbbell,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="glass rounded-2xl px-3 py-3 text-center"
          >
            <Icon className="mx-auto size-4 text-primary" />
            <p className="mt-1 font-display text-lg font-bold">{value}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              if (i === 0) setStep(0);
              else if (i === 1 && equipment.length) setStep(1);
              else if (i === 2 && muscles.length) setStep(2);
            }}
            className={cn(
              "flex-1 rounded-xl border px-2 py-2 text-center text-xs font-medium transition-colors",
              step === i
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-white/8 text-muted-foreground"
            )}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && (
            <div className="space-y-3">
              <h2 className="font-display text-xl font-bold">Your equipment</h2>
              <p className="text-sm text-muted-foreground">
                Select everything you can use today.
              </p>
              <EquipmentSelector />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <h2 className="font-display text-xl font-bold">Target muscles</h2>
              <p className="text-sm text-muted-foreground">
                2–3 groups recommended for a focused session.
              </p>
              <MuscleSelector />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold">Dial in</h2>
                <p className="text-sm text-muted-foreground">
                  Focus, length, and intensity.
                </p>
              </div>

              <div className="grid gap-2">
                {(Object.keys(FOCUS_PRESETS) as WorkoutFocus[]).map((key) => {
                  const preset = FOCUS_PRESETS[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFocus(key)}
                      className={cn(
                        "rounded-2xl border px-4 py-3.5 text-left transition-all",
                        focus === key
                          ? "border-primary/50 bg-primary/10"
                          : "border-white/8 bg-card/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{preset.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {preset.sets}×{preset.reps} · {preset.restSeconds}s
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {preset.blurb}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="glass rounded-2xl p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Exercises</span>
                  <span className="font-display text-lg font-bold text-primary">
                    {exerciseCount}
                  </span>
                </div>
                <Slider
                  value={[exerciseCount]}
                  min={4}
                  max={12}
                  step={1}
                  onValueChange={(v) => {
                    const val = Array.isArray(v) ? v[0] : v;
                    setExerciseCount(Number(val));
                  }}
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2 pb-2">
        {step > 0 && (
          <Button
            variant="secondary"
            className="h-12 flex-1"
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </Button>
        )}
        {step < 2 ? (
          <Button
            className="h-12 flex-1"
            disabled={!canContinue}
            onClick={() => setStep((s) => s + 1)}
          >
            Continue <ArrowRight className="ml-1 size-4" />
          </Button>
        ) : (
          <Button
            className="h-12 flex-1 shadow-[0_0_24px_rgb(57_255_20_/0.3)]"
            onClick={onGenerate}
          >
            <Sparkles className="mr-2 size-4" /> Generate workout
          </Button>
        )}
      </div>

      {currentWorkout.length > 0 && (
        <Link
          href="/builder"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 w-full"
          )}
        >
          Resume current workout ({currentWorkout.length})
        </Link>
      )}
    </div>
  );
}
