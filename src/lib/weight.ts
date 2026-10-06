export type BodyWeightUnit = "kg" | "lb";
export type HeightUnit = "cm" | "ft";

const LB_PER_KG = 2.2046226218;

export function toKg(value: number, unit: BodyWeightUnit | "lbs"): number {
  if (unit === "kg") return value;
  return value / LB_PER_KG;
}

export function fromKg(kg: number, unit: BodyWeightUnit | "lbs"): number {
  if (unit === "kg") return kg;
  return kg * LB_PER_KG;
}

export function convertWeight(
  value: number,
  from: BodyWeightUnit | "lbs",
  to: BodyWeightUnit | "lbs"
): number {
  return fromKg(toKg(value, from), to);
}

/** ft values use 5.11 encoding = 5 ft 11 in */
export function heightToCm(value: number, unit: HeightUnit): number {
  if (unit === "cm") return value;
  const feet = Math.floor(value);
  const inches = Math.round((value - feet) * 100);
  return (feet * 12 + inches) * 2.54;
}

export function cmToFtEncoded(cm: number): number {
  const totalIn = cm / 2.54;
  let feet = Math.floor(totalIn / 12);
  let inches = Math.round(totalIn - feet * 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  return feet + inches / 100;
}

export function convertHeight(value: number, from: HeightUnit, to: HeightUnit): number {
  if (from === to) return value;
  if (to === "cm") return Math.round(heightToCm(value, from));
  return cmToFtEncoded(heightToCm(value, from));
}

export function formatHeightInput(value: number, unit: HeightUnit): string {
  if (unit === "cm") return String(Math.round(value));
  const feet = Math.floor(value);
  const inches = Math.round((value - feet) * 100);
  return `${feet}.${String(inches).padStart(2, "0")}`;
}

export function roundWeight(value: number, decimals = 1): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

export function formatWeight(value: number, decimals = 1): string {
  return roundWeight(value, decimals).toFixed(decimals);
}

export function localDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(key: string, days: number): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

export function unitLabel(unit: BodyWeightUnit | "lbs"): "kg" | "lb" {
  return unit === "kg" ? "kg" : "lb";
}
