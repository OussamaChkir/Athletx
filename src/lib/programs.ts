import { createWorkoutExercise, getExerciseById } from "./exercises";
import type { WorkoutExercise } from "./types";

export type ProgramLevel = "Beginner" | "Intermediate" | "Advanced";

export interface ProgramExercise {
  /** `_id` from src/data/exercises.json */
  id: string;
  sets: number;
  reps: number;
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

const ex = (id: string, sets: number, reps: number): ProgramExercise => ({ id, sets, reps });

/**
 * Prepared programs. The first FREE_PREPARED_WORKOUT_COUNT (see entitlements.ts) are free; the order matters.
 * Exercise ids come from src/data/exercises.json.
 */
export const PROGRAMS: Program[] = [
  {
    id: "1",
    title: "Titan Awakening",
    subtitle: "Full Body Split",
    description: "Three full-body sessions a week that teach the main lifts and build a solid base of strength.",
    equipment: "Full gym",
    focus: "Full Body",
    level: "Beginner",
    category: "FULL BODY",
    programLength: 4,
    recommendedDays: [1, 3, 5],
    minutesPerSet: 3,
    days: [
      {
        label: "Full Body A",
        muscles: "Chest · Back · Legs",
        exercises: [
          ex("8f0fd0124dd74c6b9d0dbd0c", 3, 10), // Dumbbell Bench Press
          ex("cc4187e70cd34865a99f4159", 3, 10), // Wide-Grip Pulldown
          ex("85b7741b29f141a3bf7fecc6", 3, 12), // Leg Press
          ex("32aee0fbeb1e4f3dbbcc125e", 3, 10), // Dumbbell Shoulder Press
          ex("4eb5baa4dd7a45889433659e", 3, 15), // Crunch
        ],
      },
      {
        label: "Full Body B",
        muscles: "Legs · Back · Shoulders",
        exercises: [
          ex("ee604e80cb054ca0911e751c", 3, 10), // Dumbbell Goblet Squat
          ex("05c884512a1d4f6684f8ed0e", 3, 10), // Seated Cable Row
          ex("7e98a9f926a14828b088b1a6", 3, 10), // Push Ups
          ex("fac8ba687db94109b3cacc74", 3, 12), // Lying Leg Curl
          ex("4c98d21e31a646a89fe885b6", 3, 12), // Dumbbell Lateral Raise
        ],
      },
      {
        label: "Full Body C",
        muscles: "Legs · Chest · Back",
        exercises: [
          ex("43fc95cad36d43fe973f3752", 3, 10), // Hack Squat
          ex("24c5b920e3cb4e168d966284", 3, 10), // Incline Dumbbell Bench Press
          ex("833eb8262a69497afd864266", 3, 10), // Seated Row Machine
          ex("37a316beb32644fe91a31687", 3, 15), // Bodyweight Glute Bridge
          ex("791cc021be2141efbcd6ebec", 3, 12), // Hammer Curl
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Pec Destroyer",
    subtitle: "Chest Focus",
    description: "Two chest-heavy days a week that hit every angle of the pecs, with triceps work to finish.",
    equipment: "Full gym",
    focus: "Chest",
    level: "Intermediate",
    category: "CHEST",
    programLength: 4,
    recommendedDays: [1, 4],
    minutesPerSet: 3.5,
    days: [
      {
        label: "Chest Heavy",
        muscles: "Chest · Triceps",
        exercises: [
          ex("6c26f0a1f16b4c0cb078ea11", 4, 8), // Barbell Bench Press
          ex("24c5b920e3cb4e168d966284", 3, 10), // Incline Dumbbell Bench Press
          ex("4bd77467112f4c2d993d14cc", 3, 12), // Cable Crossover
          ex("0ce3f4311b0345a28a26870e", 3, 12), // Triceps Pressdown
        ],
      },
      {
        label: "Chest Volume",
        muscles: "Chest · Triceps",
        exercises: [
          ex("efdd093e070347e1bc3d9bcc", 4, 8), // Incline Barbell Bench Press
          ex("da3384c2254840598997d053", 3, 12), // Dumbbell Fly
          ex("606d1a1773a84a80924f1882", 3, 12), // Peck Deck
          ex("4dc7e3f4750a49b5bd75091b", 3, 12), // Dumbbell Overhead Triceps Extension
        ],
      },
    ],
  },
  {
    id: "3",
    title: "Squat Protocol",
    subtitle: "Leg Day",
    description: "Two leg days built around the squat, split between quad and hamstring and glute work.",
    equipment: "Full gym",
    focus: "Legs",
    level: "Intermediate",
    category: "LEGS",
    programLength: 6,
    recommendedDays: [1, 4],
    minutesPerSet: 3.5,
    days: [
      {
        label: "Quad Focus",
        muscles: "Quads · Glutes · Calves",
        exercises: [
          ex("31822a10da00447f987a1fd0", 4, 6), // Squat
          ex("85b7741b29f141a3bf7fecc6", 3, 10), // Leg Press
          ex("79aa45dca456441ea36b4cbc", 3, 12), // Leg Extension
          ex("a740aa82a5e9a04c5a3e6071", 3, 10), // Dumbbell Walking Lunge
          ex("fb1c1f88ceaf409e9ef2e235", 4, 15), // Standing Calf Raise
        ],
      },
      {
        label: "Posterior Focus",
        muscles: "Hamstrings · Glutes · Calves",
        exercises: [
          ex("6ccd76d4228a42809812cc43", 3, 10), // Dumbbell Stiff-Leg Deadlift
          ex("fac8ba687db94109b3cacc74", 3, 12), // Lying Leg Curl
          ex("82d578153f97497d890cbf18", 3, 10), // Barbell Hip Thrust
          ex("15513d84d12d4a44a6f11feb", 3, 8), // Front Squat
          ex("f2a351afefc94f268d583d77", 4, 15), // Seated Calf Raise
        ],
      },
    ],
  },
  {
    id: "4",
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
    id: "5",
    title: "V-Taper Build",
    subtitle: "Back Focus",
    description: "Two back-focused days that widen your lats and thicken your upper back, with shoulders for the V shape.",
    equipment: "Full gym",
    focus: "Back",
    level: "Advanced",
    category: "BACK",
    programLength: 8,
    recommendedDays: [2, 5],
    minutesPerSet: 3.5,
    days: [
      {
        label: "Back Width",
        muscles: "Lats · Back · Biceps",
        exercises: [
          ex("67a7495c7b8d4fffa573407d", 4, 8), // Pull Up
          ex("cc4187e70cd34865a99f4159", 3, 10), // Wide-Grip Pulldown
          ex("09238da6f29244b4bd277ee4", 3, 12), // Straight Arm Lat Pulldown
          ex("1bf18567950040c6b276495e", 3, 10), // Barbell Curl
        ],
      },
      {
        label: "Back Thickness",
        muscles: "Back · Shoulders",
        exercises: [
          ex("dd755011db094327bd571ff8", 4, 8), // Barbell Row
          ex("422baf0e474f4f06a72c1f7f", 3, 10), // T-Bar Rows
          ex("05c884512a1d4f6684f8ed0e", 3, 10), // Seated Cable Row
          ex("4c98d21e31a646a89fe885b6", 4, 12), // Dumbbell Lateral Raise
          ex("63c85b0ecca505b622dcc21d", 3, 15), // Face Pull
        ],
      },
    ],
  },
  {
    id: "6",
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
    if (exercise) result.push(createWorkoutExercise(exercise, "hypertrophy", { sets: item.sets, reps: item.reps }));
  }
  return result;
}
