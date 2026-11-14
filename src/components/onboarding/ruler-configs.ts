import type { HeightUnit, BodyWeightUnit } from "@/lib/weight";

/** Settings for one ruler: its range, tick spacing and how values are written. */
export type RulerConfig = {
  min: number;
  max: number;
  step: number;
  majorEvery: number;
  /** Value to show when the user hasn't picked one yet. */
  fallback: number;
  /** Text under a long tick. */
  formatLabel: (value: number) => string;
  /** The big number and the unit next to it. */
  formatReadout: (value: number) => { main: string; unit: string };
};

const feet = (inches: number) => Math.floor(inches / 12);

/** Heights are stored as centimeters, or as feet.inches (5.11 = 5 ft 11 in) when the unit is ft. */
export const HEIGHT_RULERS: Record<HeightUnit, RulerConfig> = {
  cm: {
    min: 120,
    max: 230,
    step: 1,
    majorEvery: 10,
    fallback: 170,
    formatLabel: (v) => String(v),
    formatReadout: (v) => ({ main: String(v), unit: "cm" }),
  },
  // The ft ruler counts whole inches; use inchesToFtValue / ftValueToInches to talk to the store.
  ft: {
    min: 48,
    max: 96,
    step: 1,
    majorEvery: 12,
    fallback: 67,
    formatLabel: (v) => `${feet(v)}'`,
    formatReadout: (v) => ({ main: `${feet(v)}'${v % 12}"`, unit: "ft" }),
  },
};

export const WEIGHT_RULERS: Record<BodyWeightUnit, RulerConfig> = {
  kg: {
    min: 30,
    max: 250,
    step: 0.5,
    majorEvery: 10,
    fallback: 70,
    formatLabel: (v) => String(v),
    formatReadout: (v) => ({ main: String(v), unit: "kg" }),
  },
  lb: {
    min: 60,
    max: 550,
    step: 1,
    majorEvery: 10,
    fallback: 154,
    formatLabel: (v) => String(v),
    formatReadout: (v) => ({ main: String(v), unit: "lb" }),
  },
};

/** 71 inches → 5.11 */
export const inchesToFtValue = (inches: number) => feet(inches) + (inches % 12) / 100;

/** 5.11 → 71 inches */
export function ftValueToInches(value: number) {
  const ft = Math.floor(value + 1e-9);
  return ft * 12 + Math.round((value - ft) * 100);
}
