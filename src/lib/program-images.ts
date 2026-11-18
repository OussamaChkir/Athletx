/**
 * Cover pictures for the prepared programs, keyed by program id. A program without an entry
 * (or with a typo here) simply shows the dumbbell placeholder, so images can be added one by one:
 * drop the file in assets/images/program/ and add a line below.
 */
const PROGRAM_IMAGES: Record<string, number> = {
  "gym-starter": require("../../assets/images/program/gym_starter.png"),
  "her-strong-start": require("../../assets/images/program/her_strong_start.png"),
  "upper-lower": require("../../assets/images/program/upper_lower.png"),
  "push-pull-legs": require("../../assets/images/program/push_pull_legs.png"),
  "bro-split": require("../../assets/images/program/bro_split.png"),
  "glute-sculpt": require("../../assets/images/program/glute_sculpt.png"),
  "iron-strength": require("../../assets/images/program/iron_strength.png"),
  "golden-era": require("../../assets/images/program/golden_era.png"),
};

export function getProgramImage(programId: string): number | undefined {
  return PROGRAM_IMAGES[programId];
}
