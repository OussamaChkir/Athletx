import i18n from "@/i18n";
import type { EquipmentId, MuscleId, WorkoutFocus } from "./types";

/**
 * Translated labels for the fixed lists in constants.ts. Use these instead of `.label` / `.description` /
 * `FOCUS_PRESETS[x].label` when showing text. The calling component must also use `useTranslation()` so it
 * re-renders when the language changes.
 */
export const equipmentLabel = (id: EquipmentId) => i18n.t(`common:equipment.${id}.label`);
export const equipmentDescription = (id: EquipmentId) => i18n.t(`common:equipment.${id}.description`);
export const muscleLabel = (id: MuscleId) => i18n.t(`common:muscles.${id}`);
export const focusLabel = (focus: WorkoutFocus) => i18n.t(`common:focus.${focus}.label`);
export const focusBlurb = (focus: WorkoutFocus) => i18n.t(`common:focus.${focus}.blurb`);
