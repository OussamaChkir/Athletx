import i18n from "@/i18n";
import { createWorkoutExercise, getExerciseById } from "./exercises";
import type { WorkoutExercise } from "./types";

export type ProgramLevel = "Beginner" | "Intermediate" | "Advanced";

export interface ProgramExercise {
  /** `_id` from src/data/exercises.json */
  id: string;
  sets: number;
  reps: number;
  /** Rest between sets in seconds. Defaults to the app's standard rest when omitted. */
  rest?: number;
}

export interface ProgramDay {
  /** "Push", "Full Body A", ... */
  label: string;
  /** "Chest · Shoulders · Triceps" */
  muscles: string;
  exercises: ProgramExercise[];
}

export interface Program {
  id: string;
  title: string;
  /** Short split name shown on the Library card, e.g. "Full Body Split". */
  subtitle: string;
  description: string;
  /** Where it can be done: "Full gym" or "At home". */
  equipment: "Full gym" | "At home";
  focus: string;
  level: ProgramLevel;
  /** Used as the plan's phase name when a user enrolls. */
  category: string;
  programLength: number; // weeks
  /** Recommended training days, 0 = Sun … 6 = Sat. One entry per item of `days`, in the same order. */
  recommendedDays: number[];
  /** Rough minutes per set including rest, used to estimate session length. */
  minutesPerSet: number;
  days: ProgramDay[];
}

const ex = (id: string, sets: number, reps: number, rest?: number): ProgramExercise => ({ id, sets, reps, rest });

/**
 * Prepared programs. The first FREE_PREPARED_WORKOUT_COUNT (see entitlements.ts) are free; the order matters.
 * Exercise ids come from src/data/exercises.json.
 */
export const PROGRAMS: Program[] = [
  {
    id: "gym-starter",
    title: "Gym Starter",
    subtitle: "Full Body Basics",
    description: "Your first gym program. Three easy full-body sessions on machines and simple dumbbell lifts, so you learn the moves and build confidence.",
    equipment: "Full gym",
    focus: "Full Body",
    level: "Beginner",
    category: "FULL BODY",
    programLength: 8,
    recommendedDays: [1, 3, 5],
    minutesPerSet: 3,
    days: [
      {
        label: "Full Body A",
        muscles: "Legs \u00b7 Chest \u00b7 Back",
        exercises: [
          ex("85b7741b29f141a3bf7fecc6", 3, 12, 90), // Leg Press
          ex("5804039512d04f97844556e5", 3, 10, 90), // Chest Press Machine
          ex("833eb8262a69497afd864266", 3, 10, 90), // Seated Row Machine
          ex("7be46b1f2e6bbef46a214b4e", 2, 10, 75), // Shoulder Press Machine
          ex("094a0a9ad9444379b48d4ac6", 2, 12, 60), // Seated Leg Curl
          ex("29b4f95a4ea6480fa966c6ca", 2, 15, 45), // Crunch Machine
        ],
      },
      {
        label: "Full Body B",
        muscles: "Legs \u00b7 Back \u00b7 Chest",
        exercises: [
          ex("ee604e80cb054ca0911e751c", 3, 10, 90), // Dumbbell Goblet Squat
          ex("cc4187e70cd34865a99f4159", 3, 10, 90), // Wide-Grip Pulldown
          ex("671493493d02573aaebec1e3", 3, 10, 75), // Dumbbell Floor Press
          ex("c94f6f548e2b23807fed3e0b", 3, 12, 75), // Dumbbell Hip Thrust
          ex("58bb803a3232916ad247cd3f", 2, 12, 60), // Lateral Raise Machine
          ex("0ce3f4311b0345a28a26870e", 2, 12, 60), // Triceps Pressdown
        ],
      },
      {
        label: "Full Body C",
        muscles: "Legs \u00b7 Chest \u00b7 Back",
        exercises: [
          ex("43fc95cad36d43fe973f3752", 3, 10, 90), // Hack Squat
          ex("545e54ac671a011f777d1e9a", 3, 10, 90), // Incline Chest Press Machine
          ex("da70b4eed86ef107e57c462f", 3, 8, 90), // Assisted Pull Up Machine
          ex("a969b3b2cf1b2118b2e5eb03", 2, 12, 60), // Back Extension
          ex("a0cededf815f2c45cf0b022e", 2, 12, 60), // Preacher Curl Machine
          ex("9b1990f21beaf05d132b1a88", 2, 10, 45), // Dead Bug
        ],
      },
    ],
  },
  {
    id: "her-strong-start",
    title: "Her Strong Start",
    subtitle: "Beginner Women's Plan",
    description: "A friendly first plan for women new to the gym. Glute and leg work, a full upper-body day, and core, all on easy-to-learn machines and dumbbells.",
    equipment: "Full gym",
    focus: "Glutes & Full Body",
    level: "Beginner",
    category: "FULL BODY",
    programLength: 8,
    recommendedDays: [1, 3, 5],
    minutesPerSet: 3,
    days: [
      {
        label: "Glutes & Legs",
        muscles: "Glutes \u00b7 Quads \u00b7 Hamstrings",
        exercises: [
          ex("c94f6f548e2b23807fed3e0b", 3, 12, 75), // Dumbbell Hip Thrust
          ex("85b7741b29f141a3bf7fecc6", 3, 12, 90), // Leg Press
          ex("4589397818894e2263d4271b", 3, 12, 75), // Dumbbell Sumo Squat
          ex("094a0a9ad9444379b48d4ac6", 3, 12, 60), // Seated Leg Curl
          ex("f0bdcee9558a4d10984919ca", 3, 15, 45), // Seated Hip Abduction Machine
          ex("fb1c1f88ceaf409e9ef2e235", 3, 15, 45), // Standing Calf Raise
        ],
      },
      {
        label: "Upper Body",
        muscles: "Back \u00b7 Chest \u00b7 Shoulders \u00b7 Arms",
        exercises: [
          ex("cc4187e70cd34865a99f4159", 3, 10, 90), // Wide-Grip Pulldown
          ex("5804039512d04f97844556e5", 3, 10, 90), // Chest Press Machine
          ex("833eb8262a69497afd864266", 3, 10, 90), // Seated Row Machine
          ex("7be46b1f2e6bbef46a214b4e", 2, 10, 75), // Shoulder Press Machine
          ex("0ce3f4311b0345a28a26870e", 2, 12, 60), // Triceps Pressdown
          ex("a0cededf815f2c45cf0b022e", 2, 12, 60), // Preacher Curl Machine
        ],
      },
      {
        label: "Full Body & Core",
        muscles: "Legs \u00b7 Back \u00b7 Glutes \u00b7 Core",
        exercises: [
          ex("ee604e80cb054ca0911e751c", 3, 10, 90), // Dumbbell Goblet Squat
          ex("6ccd76d4228a42809812cc43", 3, 10, 90), // Dumbbell Stiff-Leg Deadlift
          ex("771f8d1d5a156392da839331", 3, 10, 75), // Chest-Supported Dumbbell Row
          ex("7e98a9f926a14828b088b1a6", 2, 8, 60), // Push Ups
          ex("ea7a4f37caa2e6a2e2734947", 3, 12, 60), // Glute Kickback Machine
          ex("9b1990f21beaf05d132b1a88", 3, 10, 45), // Dead Bug
        ],
      },
    ],
  },
  {
    id: "upper-lower",
    title: "Upper / Lower",
    subtitle: "4-Day Split",
    description: "Four days a week: two upper-body and two lower-body sessions. Heavy compound lifts first, then volume work. A great step up from full-body training.",
    equipment: "Full gym",
    focus: "Strength & Size",
    level: "Intermediate",
    category: "UPPER LOWER",
    programLength: 8,
    recommendedDays: [1, 2, 4, 5],
    minutesPerSet: 3.5,
    days: [
      {
        label: "Upper A",
        muscles: "Chest \u00b7 Back \u00b7 Shoulders \u00b7 Arms",
        exercises: [
          ex("6c26f0a1f16b4c0cb078ea11", 4, 6, 150), // Barbell Bench Press
          ex("dd755011db094327bd571ff8", 4, 8, 120), // Barbell Row
          ex("32aee0fbeb1e4f3dbbcc125e", 3, 10, 90), // Dumbbell Shoulder Press
          ex("cc4187e70cd34865a99f4159", 3, 10, 90), // Wide-Grip Pulldown
          ex("0ce3f4311b0345a28a26870e", 3, 12, 60), // Triceps Pressdown
          ex("382da853e09742938789faa9", 3, 12, 60), // Alternating Dumbbell Curl
        ],
      },
      {
        label: "Lower A",
        muscles: "Quads \u00b7 Hamstrings \u00b7 Calves \u00b7 Abs",
        exercises: [
          ex("31822a10da00447f987a1fd0", 4, 6, 150), // Squat
          ex("6ccd76d4228a42809812cc43", 3, 10, 120), // Dumbbell Stiff-Leg Deadlift
          ex("85b7741b29f141a3bf7fecc6", 3, 12, 90), // Leg Press
          ex("fac8ba687db94109b3cacc74", 3, 12, 60), // Lying Leg Curl
          ex("fb1c1f88ceaf409e9ef2e235", 4, 12, 45), // Standing Calf Raise
          ex("d5d03ca4a52b471b9f5c34e9", 3, 12, 60), // Hanging Leg Raise
        ],
      },
      {
        label: "Upper B",
        muscles: "Chest \u00b7 Back \u00b7 Shoulders \u00b7 Triceps",
        exercises: [
          ex("24c5b920e3cb4e168d966284", 3, 10, 90), // Incline Dumbbell Bench Press
          ex("05c884512a1d4f6684f8ed0e", 3, 10, 90), // Seated Cable Row
          ex("469a7dd5ff0da280c267c8cf", 3, 10, 90), // Arnold Press
          ex("4c98d21e31a646a89fe885b6", 3, 15, 45), // Dumbbell Lateral Raise
          ex("63c85b0ecca505b622dcc21d", 3, 15, 45), // Face Pull
          ex("6497a5a78ec1f7c722634bf0", 3, 12, 60), // Overhead Cable Triceps Extension
        ],
      },
      {
        label: "Lower B",
        muscles: "Glutes \u00b7 Quads \u00b7 Hamstrings \u00b7 Calves",
        exercises: [
          ex("82d578153f97497d890cbf18", 4, 10, 90), // Barbell Hip Thrust
          ex("43fc95cad36d43fe973f3752", 3, 10, 90), // Hack Squat
          ex("bbe2b64ee35b003a07f4a670", 3, 10, 90), // Dumbbell Bulgarian Split Squat
          ex("094a0a9ad9444379b48d4ac6", 3, 12, 60), // Seated Leg Curl
          ex("f2a351afefc94f268d583d77", 4, 15, 45), // Seated Calf Raise
          ex("220cba8d8f874c94954bd93f", 3, 15, 45), // Rope Ab Pulldown
        ],
      },
    ],
  },
  {
    id: "push-pull-legs",
    title: "Push Pull Legs",
    subtitle: "6-Day Split",
    description: "The classic PPL: push, pull and legs, run twice a week. Each muscle gets hit twice for steady muscle gain. Best if you can train six days.",
    equipment: "Full gym",
    focus: "Muscle Building",
    level: "Intermediate",
    category: "PUSH PULL LEGS",
    programLength: 8,
    recommendedDays: [1, 2, 3, 4, 5, 6],
    minutesPerSet: 3.2,
    days: [
      {
        label: "Push A",
        muscles: "Chest \u00b7 Shoulders \u00b7 Triceps",
        exercises: [
          ex("6c26f0a1f16b4c0cb078ea11", 4, 6, 150), // Barbell Bench Press
          ex("32aee0fbeb1e4f3dbbcc125e", 3, 10, 90), // Dumbbell Shoulder Press
          ex("24c5b920e3cb4e168d966284", 3, 10, 90), // Incline Dumbbell Bench Press
          ex("4c98d21e31a646a89fe885b6", 3, 15, 45), // Dumbbell Lateral Raise
          ex("0ce3f4311b0345a28a26870e", 3, 12, 60), // Triceps Pressdown
          ex("6497a5a78ec1f7c722634bf0", 3, 12, 60), // Overhead Cable Triceps Extension
        ],
      },
      {
        label: "Pull A",
        muscles: "Back \u00b7 Biceps",
        exercises: [
          ex("dd755011db094327bd571ff8", 4, 8, 120), // Barbell Row
          ex("cc4187e70cd34865a99f4159", 3, 10, 90), // Wide-Grip Pulldown
          ex("05c884512a1d4f6684f8ed0e", 3, 10, 90), // Seated Cable Row
          ex("63c85b0ecca505b622dcc21d", 3, 15, 45), // Face Pull
          ex("eed2f9a2841644b0b093280f", 3, 10, 60), // EZ Barbell Curl
          ex("791cc021be2141efbcd6ebec", 3, 12, 60), // Hammer Curl
        ],
      },
      {
        label: "Legs A",
        muscles: "Quads \u00b7 Hamstrings \u00b7 Calves",
        exercises: [
          ex("31822a10da00447f987a1fd0", 4, 6, 150), // Squat
          ex("85b7741b29f141a3bf7fecc6", 3, 12, 90), // Leg Press
          ex("6ccd76d4228a42809812cc43", 3, 10, 90), // Dumbbell Stiff-Leg Deadlift
          ex("79aa45dca456441ea36b4cbc", 3, 12, 60), // Leg Extension
          ex("fac8ba687db94109b3cacc74", 3, 12, 60), // Lying Leg Curl
          ex("fb1c1f88ceaf409e9ef2e235", 4, 12, 45), // Standing Calf Raise
        ],
      },
      {
        label: "Push B",
        muscles: "Chest \u00b7 Shoulders \u00b7 Triceps",
        exercises: [
          ex("efdd093e070347e1bc3d9bcc", 4, 8, 120), // Incline Barbell Bench Press
          ex("469a7dd5ff0da280c267c8cf", 3, 10, 90), // Arnold Press
          ex("4bd77467112f4c2d993d14cc", 3, 12, 60), // Cable Crossover
          ex("b185ccf409ee4433a8a0add5", 3, 15, 45), // Cable One-Arm Lateral Raise
          ex("10c447dce93642099f172fc4", 3, 12, 60), // Cable Rope Pushdown
          ex("741ea2a2c22a439880907458", 3, 12, 60), // Lying Dumbbell Triceps Extension
        ],
      },
      {
        label: "Pull B",
        muscles: "Back \u00b7 Rear Delts \u00b7 Biceps",
        exercises: [
          ex("67a7495c7b8d4fffa573407d", 4, 8, 120), // Pull Up
          ex("bb835e9eda0f4c9b9db7410b", 3, 10, 90), // Dumbbell Bent Over Rows
          ex("771e86eac943463d862a70f9", 3, 10, 90), // Close-Grip Pulldown
          ex("83bd44ff9ed093baca2cea13", 3, 15, 45), // Reverse Pec Deck
          ex("c79f523828244fe2a103937e", 3, 12, 60), // Incline Dumbbell Curl
          ex("31309b47be5345649290fdab", 3, 12, 60), // Rope Cable Curl
        ],
      },
      {
        label: "Legs B",
        muscles: "Glutes \u00b7 Quads \u00b7 Hamstrings \u00b7 Calves",
        exercises: [
          ex("82d578153f97497d890cbf18", 4, 10, 90), // Barbell Hip Thrust
          ex("43fc95cad36d43fe973f3752", 3, 10, 90), // Hack Squat
          ex("bbe2b64ee35b003a07f4a670", 3, 10, 90), // Dumbbell Bulgarian Split Squat
          ex("094a0a9ad9444379b48d4ac6", 3, 12, 60), // Seated Leg Curl
          ex("f2a351afefc94f268d583d77", 4, 15, 45), // Seated Calf Raise
          ex("d5d03ca4a52b471b9f5c34e9", 3, 12, 60), // Hanging Leg Raise
        ],
      },
    ],
  },
  {
    id: "bro-split",
    title: "Bro Split",
    subtitle: "5-Day Body-Part Split",
    description: "One muscle group per day: chest, back, shoulders, legs and arms. High volume on each muscle, perfect for the pump and for a busy gym week.",
    equipment: "Full gym",
    focus: "Bodybuilding",
    level: "Intermediate",
    category: "BRO SPLIT",
    programLength: 8,
    recommendedDays: [1, 2, 3, 4, 5],
    minutesPerSet: 3.3,
    days: [
      {
        label: "Chest Day",
        muscles: "Chest",
        exercises: [
          ex("6c26f0a1f16b4c0cb078ea11", 4, 8, 120), // Barbell Bench Press
          ex("24c5b920e3cb4e168d966284", 4, 10, 90), // Incline Dumbbell Bench Press
          ex("5804039512d04f97844556e5", 3, 12, 75), // Chest Press Machine
          ex("4bd77467112f4c2d993d14cc", 3, 12, 60), // Cable Crossover
          ex("606d1a1773a84a80924f1882", 3, 15, 60), // Peck Deck
        ],
      },
      {
        label: "Back Day",
        muscles: "Lats \u00b7 Back \u00b7 Traps",
        exercises: [
          ex("67a7495c7b8d4fffa573407d", 4, 8, 120), // Pull Up
          ex("dd755011db094327bd571ff8", 4, 8, 120), // Barbell Row
          ex("05c884512a1d4f6684f8ed0e", 3, 10, 90), // Seated Cable Row
          ex("09238da6f29244b4bd277ee4", 3, 12, 60), // Straight Arm Lat Pulldown
          ex("d6d6e0efc3ab40b19ebcc330", 3, 12, 60), // Dumbbell Shrugs
          ex("a969b3b2cf1b2118b2e5eb03", 3, 12, 60), // Back Extension
        ],
      },
      {
        label: "Shoulder Day",
        muscles: "Shoulders \u00b7 Traps",
        exercises: [
          ex("b406165737f948d98df3aba1", 4, 8, 120), // Standing Barbell Shoulder Press
          ex("4c98d21e31a646a89fe885b6", 4, 15, 45), // Dumbbell Lateral Raise
          ex("83bd44ff9ed093baca2cea13", 3, 15, 45), // Reverse Pec Deck
          ex("63c85b0ecca505b622dcc21d", 3, 15, 45), // Face Pull
          ex("7c53aeeaa9e348ef930df03b", 3, 12, 60), // Barbell Shrug
        ],
      },
      {
        label: "Leg Day",
        muscles: "Quads \u00b7 Hamstrings \u00b7 Calves",
        exercises: [
          ex("31822a10da00447f987a1fd0", 4, 8, 150), // Squat
          ex("85b7741b29f141a3bf7fecc6", 4, 12, 90), // Leg Press
          ex("6ccd76d4228a42809812cc43", 3, 10, 90), // Dumbbell Stiff-Leg Deadlift
          ex("79aa45dca456441ea36b4cbc", 3, 12, 60), // Leg Extension
          ex("fac8ba687db94109b3cacc74", 3, 12, 60), // Lying Leg Curl
          ex("fb1c1f88ceaf409e9ef2e235", 4, 15, 45), // Standing Calf Raise
        ],
      },
      {
        label: "Arm Day",
        muscles: "Biceps \u00b7 Triceps",
        exercises: [
          ex("eed2f9a2841644b0b093280f", 4, 10, 60), // EZ Barbell Curl
          ex("32be94bcef13464785a886e2", 4, 8, 90), // Close Grip Bench Press
          ex("c79f523828244fe2a103937e", 3, 12, 60), // Incline Dumbbell Curl
          ex("6497a5a78ec1f7c722634bf0", 3, 12, 60), // Overhead Cable Triceps Extension
          ex("791cc021be2141efbcd6ebec", 3, 12, 60), // Hammer Curl
          ex("0ce3f4311b0345a28a26870e", 3, 15, 45), // Triceps Pressdown
        ],
      },
    ],
  },
  {
    id: "glute-sculpt",
    title: "Glute & Sculpt",
    subtitle: "4-Day Glute Focus",
    description: "Four days built around strong, shapely glutes and legs, with two upper-body days to balance it out. For women with a few months of gym experience.",
    equipment: "Full gym",
    focus: "Glutes & Legs",
    level: "Intermediate",
    category: "GLUTES",
    programLength: 8,
    recommendedDays: [1, 2, 4, 5],
    minutesPerSet: 3,
    days: [
      {
        label: "Glute Day A",
        muscles: "Glutes \u00b7 Hamstrings",
        exercises: [
          ex("82d578153f97497d890cbf18", 4, 10, 90), // Barbell Hip Thrust
          ex("68ffa4d8572636e45fe6235e", 3, 10, 75), // Dumbbell Single-Leg Romanian Deadlift
          ex("bbe2b64ee35b003a07f4a670", 3, 10, 90), // Dumbbell Bulgarian Split Squat
          ex("6a404f95d5103d8d857e4472", 3, 12, 60), // Cable Pull-Through
          ex("5e1a164552484a30a6fdd9ae", 3, 12, 45), // Standing Cable Kickback
          ex("f0bdcee9558a4d10984919ca", 3, 15, 45), // Seated Hip Abduction Machine
        ],
      },
      {
        label: "Upper Body",
        muscles: "Back \u00b7 Shoulders \u00b7 Chest \u00b7 Arms",
        exercises: [
          ex("cc4187e70cd34865a99f4159", 3, 10, 90), // Wide-Grip Pulldown
          ex("32aee0fbeb1e4f3dbbcc125e", 3, 10, 90), // Dumbbell Shoulder Press
          ex("05c884512a1d4f6684f8ed0e", 3, 10, 90), // Seated Cable Row
          ex("24c5b920e3cb4e168d966284", 3, 10, 90), // Incline Dumbbell Bench Press
          ex("4c98d21e31a646a89fe885b6", 3, 15, 45), // Dumbbell Lateral Raise
          ex("0ce3f4311b0345a28a26870e", 3, 12, 60), // Triceps Pressdown
        ],
      },
      {
        label: "Glute Day B",
        muscles: "Quads \u00b7 Glutes \u00b7 Hamstrings",
        exercises: [
          ex("85b7741b29f141a3bf7fecc6", 4, 12, 90), // Leg Press
          ex("a740aa82a5e9a04c5a3e6071", 3, 10, 75), // Dumbbell Walking Lunge
          ex("2853f8e7a83b86568c2cf48f", 3, 12, 75), // Hip Thrust Machine
          ex("b4bc0a36a7d08bd68a564226", 3, 10, 60), // Dumbbell Curtsy Lunge
          ex("fac8ba687db94109b3cacc74", 3, 12, 60), // Lying Leg Curl
          ex("ea7a4f37caa2e6a2e2734947", 3, 15, 45), // Glute Kickback Machine
        ],
      },
      {
        label: "Upper & Core",
        muscles: "Back \u00b7 Shoulders \u00b7 Chest \u00b7 Core",
        exercises: [
          ex("545e54ac671a011f777d1e9a", 3, 10, 90), // Incline Chest Press Machine
          ex("bb835e9eda0f4c9b9db7410b", 3, 10, 90), // Dumbbell Bent Over Rows
          ex("469a7dd5ff0da280c267c8cf", 3, 10, 90), // Arnold Press
          ex("63c85b0ecca505b622dcc21d", 3, 15, 45), // Face Pull
          ex("aa4534769cef69143a32bee6", 3, 12, 45), // Cable Woodchop
          ex("006d9909f645e7fdcc7cd1e8", 3, 15, 45), // Bicycle Crunch
        ],
      },
    ],
  },
  {
    id: "iron-strength",
    title: "Iron Strength",
    subtitle: "4-Day Strength Split",
    description: "Get strong on the big four lifts: squat, bench, deadlift and overhead press. Heavy sets with long rests, then accessories to support them. For experienced lifters.",
    equipment: "Full gym",
    focus: "Strength",
    level: "Advanced",
    category: "STRENGTH",
    programLength: 12,
    recommendedDays: [1, 2, 4, 5],
    minutesPerSet: 3.6,
    days: [
      {
        label: "Squat Day",
        muscles: "Squat \u00b7 Legs",
        exercises: [
          ex("31822a10da00447f987a1fd0", 5, 5, 180), // Squat
          ex("15513d84d12d4a44a6f11feb", 3, 6, 150), // Front Squat
          ex("82d578153f97497d890cbf18", 3, 8, 120), // Barbell Hip Thrust
          ex("fac8ba687db94109b3cacc74", 3, 10, 75), // Lying Leg Curl
          ex("fb1c1f88ceaf409e9ef2e235", 4, 10, 60), // Standing Calf Raise
          ex("7c2f3f38ab05217bc41a1be0", 3, 10, 60), // Ab Wheel Rollout
        ],
      },
      {
        label: "Bench Day",
        muscles: "Bench \u00b7 Chest \u00b7 Back",
        exercises: [
          ex("6c26f0a1f16b4c0cb078ea11", 5, 5, 180), // Barbell Bench Press
          ex("dd755011db094327bd571ff8", 4, 6, 150), // Barbell Row
          ex("24c5b920e3cb4e168d966284", 3, 8, 90), // Incline Dumbbell Bench Press
          ex("5f2807404223c9cb408eabbe", 3, 8, 90), // Chest Dip
          ex("32be94bcef13464785a886e2", 3, 8, 90), // Close Grip Bench Press
          ex("63c85b0ecca505b622dcc21d", 3, 15, 45), // Face Pull
        ],
      },
      {
        label: "Deadlift Day",
        muscles: "Deadlift \u00b7 Back \u00b7 Hamstrings",
        exercises: [
          ex("46e64349013346b38269c76d", 5, 3, 180), // Barbell Deadlift
          ex("67a7495c7b8d4fffa573407d", 4, 6, 120), // Pull Up
          ex("5bb0b1578d19a309dec689af", 4, 6, 120), // Pendlay Row
          ex("2ab32a59bc384fd1a14b6e16", 3, 8, 75), // Glute Ham Raise
          ex("1bf18567950040c6b276495e", 3, 8, 60), // Barbell Curl
          ex("17ecfd6280e8c286f9ca00db", 3, 8, 60), // Toes to Bar
        ],
      },
      {
        label: "Press Day",
        muscles: "Overhead Press \u00b7 Shoulders \u00b7 Arms",
        exercises: [
          ex("b406165737f948d98df3aba1", 5, 5, 150), // Standing Barbell Shoulder Press
          ex("efdd093e070347e1bc3d9bcc", 4, 6, 120), // Incline Barbell Bench Press
          ex("4c98d21e31a646a89fe885b6", 4, 12, 45), // Dumbbell Lateral Raise
          ex("83bd44ff9ed093baca2cea13", 3, 15, 45), // Reverse Pec Deck
          ex("eed2f9a2841644b0b093280f", 3, 8, 60), // EZ Barbell Curl
          ex("bc2a45caa09346d59637137c", 3, 10, 60), // Lying Triceps Extension
        ],
      },
    ],
  },
  {
    id: "golden-era",
    title: "Golden Era",
    subtitle: "6-Day Classic Split",
    description: "Old-school bodybuilding: chest and back together, shoulders and arms together, and legs, all twice a week. High volume for advanced lifters who recover well.",
    equipment: "Full gym",
    focus: "Bodybuilding",
    level: "Advanced",
    category: "BODYBUILDING",
    programLength: 8,
    recommendedDays: [1, 2, 3, 4, 5, 6],
    minutesPerSet: 3.2,
    days: [
      {
        label: "Chest & Back A",
        muscles: "Chest \u00b7 Back",
        exercises: [
          ex("6c26f0a1f16b4c0cb078ea11", 4, 8, 120), // Barbell Bench Press
          ex("67a7495c7b8d4fffa573407d", 4, 8, 120), // Pull Up
          ex("24c5b920e3cb4e168d966284", 3, 10, 90), // Incline Dumbbell Bench Press
          ex("dd755011db094327bd571ff8", 3, 10, 90), // Barbell Row
          ex("da3384c2254840598997d053", 3, 12, 60), // Dumbbell Fly
          ex("09238da6f29244b4bd277ee4", 3, 12, 60), // Straight Arm Lat Pulldown
        ],
      },
      {
        label: "Shoulders & Arms A",
        muscles: "Shoulders \u00b7 Biceps \u00b7 Triceps",
        exercises: [
          ex("b406165737f948d98df3aba1", 4, 8, 120), // Standing Barbell Shoulder Press
          ex("4c98d21e31a646a89fe885b6", 4, 15, 45), // Dumbbell Lateral Raise
          ex("1bf18567950040c6b276495e", 3, 10, 60), // Barbell Curl
          ex("32be94bcef13464785a886e2", 3, 10, 90), // Close Grip Bench Press
          ex("83bd44ff9ed093baca2cea13", 3, 15, 45), // Reverse Pec Deck
          ex("0ce3f4311b0345a28a26870e", 3, 12, 60), // Triceps Pressdown
        ],
      },
      {
        label: "Legs A",
        muscles: "Quads \u00b7 Hamstrings \u00b7 Calves",
        exercises: [
          ex("31822a10da00447f987a1fd0", 4, 8, 150), // Squat
          ex("85b7741b29f141a3bf7fecc6", 4, 12, 90), // Leg Press
          ex("6ccd76d4228a42809812cc43", 4, 10, 90), // Dumbbell Stiff-Leg Deadlift
          ex("79aa45dca456441ea36b4cbc", 3, 12, 60), // Leg Extension
          ex("fac8ba687db94109b3cacc74", 3, 12, 60), // Lying Leg Curl
          ex("fb1c1f88ceaf409e9ef2e235", 5, 12, 45), // Standing Calf Raise
        ],
      },
      {
        label: "Chest & Back B",
        muscles: "Chest \u00b7 Back",
        exercises: [
          ex("efdd093e070347e1bc3d9bcc", 4, 8, 120), // Incline Barbell Bench Press
          ex("422baf0e474f4f06a72c1f7f", 4, 8, 120), // T-Bar Rows
          ex("5f2807404223c9cb408eabbe", 3, 10, 90), // Chest Dip
          ex("771e86eac943463d862a70f9", 3, 10, 90), // Close-Grip Pulldown
          ex("4bd77467112f4c2d993d14cc", 3, 12, 60), // Cable Crossover
          ex("6057a66e57db4cae92772144", 3, 12, 60), // Dumbbell Pullover
        ],
      },
      {
        label: "Shoulders & Arms B",
        muscles: "Shoulders \u00b7 Biceps \u00b7 Triceps",
        exercises: [
          ex("469a7dd5ff0da280c267c8cf", 4, 10, 90), // Arnold Press
          ex("b185ccf409ee4433a8a0add5", 4, 15, 45), // Cable One-Arm Lateral Raise
          ex("7ca142bc1ad94f148af58893", 3, 10, 60), // EZ Barbell Preacher Curl
          ex("6497a5a78ec1f7c722634bf0", 3, 12, 60), // Overhead Cable Triceps Extension
          ex("63c85b0ecca505b622dcc21d", 3, 15, 45), // Face Pull
          ex("c79f523828244fe2a103937e", 3, 12, 60), // Incline Dumbbell Curl
        ],
      },
      {
        label: "Legs B",
        muscles: "Glutes \u00b7 Quads \u00b7 Hamstrings \u00b7 Calves",
        exercises: [
          ex("82d578153f97497d890cbf18", 4, 10, 90), // Barbell Hip Thrust
          ex("43fc95cad36d43fe973f3752", 4, 10, 90), // Hack Squat
          ex("4c7e02af796a42d6cca1b70e", 3, 10, 90), // Barbell Reverse Lunge
          ex("094a0a9ad9444379b48d4ac6", 3, 12, 60), // Seated Leg Curl
          ex("f2a351afefc94f268d583d77", 5, 15, 45), // Seated Calf Raise
          ex("d5d03ca4a52b471b9f5c34e9", 3, 12, 60), // Hanging Leg Raise
        ],
      },
    ],
  },
  {
    id: "dumbbell-home",
    title: "Dumbbell Home Builder",
    subtitle: "3-Day Push, Pull, Legs",
    description: "Build muscle at home with just dumbbells and a bench. Three sessions a week: push, pull and legs.",
    equipment: "At home",
    focus: "Muscle Building",
    level: "Intermediate",
    category: "HOME",
    programLength: 8,
    recommendedDays: [1, 3, 5],
    minutesPerSet: 3,
    days: [
      {
        label: "Push",
        muscles: "Chest \u00b7 Shoulders \u00b7 Triceps",
        exercises: [
          ex("671493493d02573aaebec1e3", 4, 10, 90), // Dumbbell Floor Press
          ex("32aee0fbeb1e4f3dbbcc125e", 3, 10, 90), // Dumbbell Shoulder Press
          ex("7e98a9f926a14828b088b1a6", 3, 12, 60), // Push Ups
          ex("4c98d21e31a646a89fe885b6", 3, 15, 45), // Dumbbell Lateral Raise
          ex("4dc7e3f4750a49b5bd75091b", 3, 12, 60), // Dumbbell Overhead Triceps Extension
        ],
      },
      {
        label: "Pull",
        muscles: "Back \u00b7 Biceps",
        exercises: [
          ex("bb835e9eda0f4c9b9db7410b", 4, 10, 90), // Dumbbell Bent Over Rows
          ex("6057a66e57db4cae92772144", 3, 12, 75), // Dumbbell Pullover
          ex("46c136760afb4877b0af82df", 3, 15, 45), // Bent-Over Lateral Raise
          ex("d6d6e0efc3ab40b19ebcc330", 3, 12, 60), // Dumbbell Shrugs
          ex("382da853e09742938789faa9", 3, 12, 60), // Alternating Dumbbell Curl
          ex("791cc021be2141efbcd6ebec", 3, 12, 60), // Hammer Curl
        ],
      },
      {
        label: "Legs",
        muscles: "Quads \u00b7 Hamstrings \u00b7 Glutes \u00b7 Calves",
        exercises: [
          ex("ee604e80cb054ca0911e751c", 4, 12, 90), // Dumbbell Goblet Squat
          ex("6ccd76d4228a42809812cc43", 3, 10, 90), // Dumbbell Stiff-Leg Deadlift
          ex("f689d9bdbfea23a540712439", 3, 10, 75), // Dumbbell Reverse Lunge
          ex("c94f6f548e2b23807fed3e0b", 3, 12, 75), // Dumbbell Hip Thrust
          ex("6a00c8d959456bde73600554", 4, 15, 45), // Dumbbell Standing Calf Raise
          ex("f7aab483ddf780a345726382", 3, 20, 45), // Russian Twist
        ],
      },
    ],
  },
  {
    id: "morning-flow",
    title: "Morning Flow",
    subtitle: "Mobility Routine",
    description: "Short bodyweight sessions every weekday morning to wake up your joints and keep you moving well.",
    equipment: "At home",
    focus: "Mobility",
    level: "Beginner",
    category: "MOBILITY",
    programLength: 4,
    recommendedDays: [1, 2, 3, 4, 5],
    minutesPerSet: 1.5,
    days: [
      {
        label: "Hips & Glutes",
        muscles: "Glutes · Hips · Legs",
        exercises: [
          ex("37a316beb32644fe91a31687", 3, 15), // Bodyweight Glute Bridge
          ex("44a8b8d5df0941a39fac6a01", 3, 12), // Donkey Kicks
          ex("bd136d54fe964f689bb8b457", 3, 12), // Fire Hydrants
          ex("10618219e6d944b7b4957068", 3, 15), // Bodyweight Squat
        ],
      },
      {
        label: "Core Control",
        muscles: "Abs · Core · Lower back",
        exercises: [
          ex("9b1990f21beaf05d132b1a88", 3, 10), // Dead Bug
          ex("b42fcbcd4dcb42ae90efa5a1", 3, 10), // Bird Dog
          ex("006d9909f645e7fdcc7cd1e8", 3, 15), // Bicycle Crunch
          ex("44a627f891b67e8da6c67b25", 3, 12), // Superman
        ],
      },
      {
        label: "Legs & Balance",
        muscles: "Quads · Hamstrings · Glutes",
        exercises: [
          ex("1ad5cd2ac3af45e993f511cf", 3, 10), // Lunge
          ex("7c5ce668574d426f89bb1316", 3, 8), // Single Leg Bodyweight Deadlift
          ex("420beed971fa5ebbded4e089", 3, 8), // Cossack Squat
          ex("292cb10f62224d51a4870bca", 3, 10), // Squat Sit to Reach
        ],
      },
      {
        label: "Upper Body",
        muscles: "Chest · Shoulders · Triceps",
        exercises: [
          ex("7e98a9f926a14828b088b1a6", 3, 10), // Push Ups
          ex("3ecd557a48092d84c4646168", 3, 8), // Pike Push Up
          ex("c698fb4facf91a901c13350a", 3, 8), // Diamond Push Up
          ex("44a627f891b67e8da6c67b25", 3, 12), // Superman
        ],
      },
      {
        label: "Full Body Flow",
        muscles: "Full Body · Abs",
        exercises: [
          ex("871005c833264f8089a581a3", 3, 12), // Standing Knee Raise
          ex("30d9de977c799f2252b18ee6", 3, 20), // Mountain Climbers
          ex("10618219e6d944b7b4957068", 3, 15), // Bodyweight Squat
          ex("4a50b0d0ff2af5028d57e100", 3, 10), // Bear Crawl
        ],
      },
    ],
  },
  {
    id: "cardio-shred",
    title: "Cardio Shred",
    subtitle: "HIIT Circuit",
    description: "Three fast, sweaty circuits a week with no gym needed. Short rests, high effort, full body.",
    equipment: "At home",
    focus: "HIIT",
    level: "Intermediate",
    category: "HIIT",
    programLength: 4,
    recommendedDays: [1, 3, 5],
    minutesPerSet: 2,
    days: [
      {
        label: "Burn A",
        muscles: "Full Body",
        exercises: [
          ex("84546cde1abd4ca1a68eeb16", 4, 10), // Burpees
          ex("97d1d2aa0cee4085864ea55d", 4, 12), // Jump Squat
          ex("30d9de977c799f2252b18ee6", 4, 20), // Mountain Climbers
          ex("7e98a9f926a14828b088b1a6", 3, 12), // Push Ups
        ],
      },
      {
        label: "Burn B",
        muscles: "Legs · Core",
        exercises: [
          ex("93d9d9a4c7784c30bc61f212", 4, 15), // Kettlebell Swings
          ex("17e014dc84cc45b48d473eb9", 3, 12), // Knee Tuck Jumps
          ex("1ad5cd2ac3af45e993f511cf", 3, 12), // Lunge
          ex("006d9909f645e7fdcc7cd1e8", 3, 20), // Bicycle Crunch
        ],
      },
      {
        label: "Burn C",
        muscles: "Upper Body · Core",
        exercises: [
          ex("0598039e4f0f2a2214b405e7", 3, 10), // Decline Push Up
          ex("3ecd557a48092d84c4646168", 3, 10), // Pike Push Up
          ex("f7aab483ddf780a345726382", 3, 20), // Russian Twist
          ex("84546cde1abd4ca1a68eeb16", 3, 10), // Burpees
        ],
      },
    ],
  },
];

/**
 * A copy of the program with its display text (title, subtitle, description, focus, category, day label and muscles)
 * in the current language. `id`, `level`, `equipment` and the exercises stay untouched, since logic relies on them.
 */
export function localizedProgram(program: Program): Program {
  const key = (path: string) => `programs:${program.id}.${path}`;
  return {
    ...program,
    title: i18n.t(key("title"), { defaultValue: program.title }),
    subtitle: i18n.t(key("subtitle"), { defaultValue: program.subtitle }),
    description: i18n.t(key("description"), { defaultValue: program.description }),
    focus: i18n.t(key("focus"), { defaultValue: program.focus }),
    category: i18n.t(key("category"), { defaultValue: program.category }),
    days: program.days.map((day, index) => ({
      ...day,
      label: i18n.t(key(`days.${index}.label`), { defaultValue: day.label }),
      muscles: i18n.t(key(`days.${index}.muscles`), { defaultValue: day.muscles }),
    })),
  };
}

export const getProgram = (id: string) => PROGRAMS.find((p) => p.id === id);

/** Position of a program in the list (the first few are free). */
export const programIndex = (id: string) => PROGRAMS.findIndex((p) => p.id === id);

const roundTo5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);

/** Estimated minutes for one day, rounded to 5. */
export function dayMinutes(program: Program, day: ProgramDay): number {
  const sets = day.exercises.reduce((total, e) => total + e.sets, 0);
  return roundTo5(sets * program.minutesPerSet);
}

/** Average session length across the program's days, rounded to 5. */
export function programMinutes(program: Program): number {
  const total = program.days.reduce((t, d) => t + dayMinutes(program, d), 0);
  return roundTo5(total / program.days.length);
}

/** Main equipment used by the program's exercises, most used first (e.g. ["Barbell", "Machines"]). */
export function programEquipment(program: Program, max = 2): string[] {
  const counts = new Map<string, number>();
  for (const day of program.days) {
    for (const e of day.exercises) {
      const item = getExerciseById(e.id)?.equipment?.[0];
      if (item) counts.set(item, (counts.get(item) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([name]) => name);
}

/** The day's exercises as workout exercises, with the program's sets and reps. Fresh instance ids on every call. */
export function buildDayExercises(day: ProgramDay): WorkoutExercise[] {
  const result: WorkoutExercise[] = [];
  for (const item of day.exercises) {
    const exercise = getExerciseById(item.id);
    if (exercise) {
      result.push(
        createWorkoutExercise(exercise, "hypertrophy", {
          sets: item.sets,
          reps: item.reps,
          ...(item.rest ? { restSeconds: item.rest } : {}),
        }),
      );
    }
  }
  return result;
}
