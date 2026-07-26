"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { EQUIPMENT_LIST } from "@/lib/constants";
import type { EquipmentId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useWorkoutStore } from "@/store/workout-store";

export function EquipmentSelector({
  compact = false,
}: {
  compact?: boolean;
}) {
  const equipment = useWorkoutStore((s) => s.equipment);
  const toggleEquipment = useWorkoutStore((s) => s.toggleEquipment);

  return (
    <div
      className={cn(
        "grid gap-3",
        compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
      )}
    >
      {EQUIPMENT_LIST.map((item, i) => {
        const selected = equipment.includes(item.id);
        return (
          <motion.button
            key={item.id}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggleEquipment(item.id as EquipmentId)}
            className={cn(
              "relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all",
              selected
                ? "border-primary/50 bg-primary/10 shadow-[0_0_24px_rgb(57_255_20_/0.15)]"
                : "border-white/8 bg-card/60 hover:border-white/15"
            )}
          >
            {selected && (
              <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" strokeWidth={3} />
              </span>
            )}
            {item.hasImage ? (
              <Image
                src={`/equipment/${item.id}.png`}
                alt={item.label}
                width={72}
                height={56}
                className="h-14 w-auto object-contain opacity-90"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-lg font-display font-bold text-primary">
                {item.label.slice(0, 1)}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold">{item.label}</p>
              {!compact && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
