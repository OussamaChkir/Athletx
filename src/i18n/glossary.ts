import { currentLanguage, useLanguage } from "./index";
import type { Language } from "./languages";

/**
 * Fixed vocabulary that appears in the exercise data (muscles, equipment, categories, difficulty) and in a few
 * lists in the app. Keys are the exact English strings used in src/data/exercises.json and src/lib/constants.ts;
 * anything missing falls back to the English text.
 */
type Group = "muscle" | "equipment" | "category" | "difficulty";

const FR: Record<Group, Record<string, string>> = {
  muscle: {
    Abs: "Abdos", Abdominals: "Abdos", Back: "Dos", Biceps: "Biceps", Brachialis: "Brachial", Calves: "Mollets",
    Chest: "Pectoraux", Core: "Tronc", Forearms: "Avant-bras", "Front Delts": "Deltoïdes antérieurs",
    "Full Body": "Corps entier", Glutes: "Fessiers", Hamstrings: "Ischio-jambiers", "Hip Flexors": "Fléchisseurs de hanche",
    "Inner Thighs": "Adducteurs", Lats: "Grands dorsaux", Legs: "Jambes", "Lower Back": "Bas du dos",
    "Lower back": "Bas du dos", Obliques: "Obliques", Quads: "Quadriceps", "Rear Delts": "Deltoïdes postérieurs",
    Shins: "Tibias", Shoulders: "Épaules", "Side Delts": "Deltoïdes latéraux", Traps: "Trapèzes",
    Triceps: "Triceps", "Upper Back": "Haut du dos",
  },
  category: {
    Back: "Dos", Bands: "Élastiques", Barbell: "Barre", Biceps: "Biceps", Bodyweight: "Poids du corps",
    Cables: "Poulies", Dumbbells: "Haltères", Kettlebell: "Kettlebell", Machines: "Machines",
    "Medicine Ball": "Médecine-ball", Shoulders: "Épaules", Triceps: "Triceps",
  },
  difficulty: { Beginner: "Débutant", Intermediate: "Intermédiaire", Advanced: "Avancé" },
  equipment: {
    "Ab Crunch Machine": "Machine à abdominaux", "Ab Wheel": "Roue abdominale", "Ankle Cuff Attachment": "Sangle de cheville",
    "Assisted Pull-up Machine": "Machine à tractions assistées", Barbell: "Barre", "Barbell Attachment": "Barre pour poulie",
    Bench: "Banc", Bodyweight: "Poids du corps", "Cable Machine": "Poulie", "Calf Raise Machine": "Machine à mollets",
    "Chest Press Machine": "Machine à développé couché", "Close Grip Attachment": "Poignée prise serrée",
    "D-Handle Attachments": "Poignées en D", "Decline Bench": "Banc décliné", Dumbbell: "Haltère", Dumbbells: "Haltères",
    "EZ Curl Bar": "Barre EZ", "Glute Ham Developer (GHD) Machine": "Banc GHD", "Glute Kickback Machine": "Machine à kickback fessiers",
    "Hack Squat Machine": "Machine à hack squat", "Hip Abduction Machine": "Machine d'abduction", "Hip Adduction Machine": "Machine d'adduction",
    "Hip Thrust Machine": "Machine à hip thrust", "Hyperextension Bench": "Banc à lombaires", "Incline Bench": "Banc incliné",
    "Incline Chest Press Machine": "Machine à développé incliné", Kettlebell: "Kettlebell", "Lat Pulldown Machine": "Machine à tirage vertical",
    "Lateral Raise Machine": "Machine à élévations latérales", "Leg Curl Machine": "Machine à leg curl", "Leg Extension Machine": "Machine à leg extension",
    "Leg Press Machine": "Presse à cuisses", "Medicine Ball": "Médecine-ball", "Mini Resistance Band": "Mini-bande élastique",
    "Parallel Dip Bars": "Barres parallèles", "Pec Deck Machine": "Machine pec deck", "Peck Deck Machine": "Machine pec deck",
    "Plyo Box": "Box de pliométrie", "Preacher Bench": "Pupitre à biceps", "Preacher Curl Machine": "Machine à curl pupitre",
    "Pull-up Bar": "Barre de traction", "Resistance Band": "Bande élastique", "Rope Attachment": "Corde pour poulie",
    "Seated Calf Raise Machine": "Machine à mollets assis", "Seated Leg Curl Machine": "Machine à leg curl assis",
    "Seated Row Machine": "Machine de tirage horizontal", "Shoulder Press Machine": "Machine à développé épaules",
    "Single Handle Attachment": "Poignée simple", "Single Handle Attachments": "Poignées simples", "Sliding Discs": "Disques de glisse",
    "Smith Machine": "Barre guidée (Smith)", "Squat Rack": "Cage à squat", "Straight Bar Attachment": "Barre droite pour poulie",
    "T-Bar Row Machine": "Machine à rowing T-bar", "Trap Bar": "Barre hexagonale", "Triceps Dip Machine": "Machine à dips triceps",
    "V-Grip Attachment": "Poignée en V", "Weight Plates": "Disques",
    // Equipment picker labels (src/lib/constants.ts)
    Bands: "Élastiques", Cables: "Poulies", Machines: "Machines", "Weight Plate": "Disque",
  },
};

const ES: Record<Group, Record<string, string>> = {
  muscle: {
    Abs: "Abdominales", Abdominals: "Abdominales", Back: "Espalda", Biceps: "Bíceps", Brachialis: "Braquial",
    Calves: "Gemelos", Chest: "Pecho", Core: "Core", Forearms: "Antebrazos", "Front Delts": "Deltoides anterior",
    "Full Body": "Cuerpo completo", Glutes: "Glúteos", Hamstrings: "Isquiotibiales", "Hip Flexors": "Flexores de cadera",
    "Inner Thighs": "Aductores", Lats: "Dorsales", Legs: "Piernas", "Lower Back": "Zona lumbar",
    "Lower back": "Zona lumbar", Obliques: "Oblicuos", Quads: "Cuádriceps", "Rear Delts": "Deltoides posterior",
    Shins: "Tibiales", Shoulders: "Hombros", "Side Delts": "Deltoides lateral", Traps: "Trapecios",
    Triceps: "Tríceps", "Upper Back": "Espalda alta",
  },
  category: {
    Back: "Espalda", Bands: "Bandas", Barbell: "Barra", Biceps: "Bíceps", Bodyweight: "Peso corporal",
    Cables: "Poleas", Dumbbells: "Mancuernas", Kettlebell: "Kettlebell", Machines: "Máquinas",
    "Medicine Ball": "Balón medicinal", Shoulders: "Hombros", Triceps: "Tríceps",
  },
  difficulty: { Beginner: "Principiante", Intermediate: "Intermedio", Advanced: "Avanzado" },
  equipment: {
    "Ab Crunch Machine": "Máquina de abdominales", "Ab Wheel": "Rueda abdominal", "Ankle Cuff Attachment": "Tobillera para polea",
    "Assisted Pull-up Machine": "Máquina de dominadas asistidas", Barbell: "Barra", "Barbell Attachment": "Barra para polea",
    Bench: "Banco", Bodyweight: "Peso corporal", "Cable Machine": "Polea", "Calf Raise Machine": "Máquina de gemelos",
    "Chest Press Machine": "Máquina de press de pecho", "Close Grip Attachment": "Agarre cerrado",
    "D-Handle Attachments": "Asas en D", "Decline Bench": "Banco declinado", Dumbbell: "Mancuerna", Dumbbells: "Mancuernas",
    "EZ Curl Bar": "Barra Z", "Glute Ham Developer (GHD) Machine": "Banco GHD", "Glute Kickback Machine": "Máquina de patada de glúteo",
    "Hack Squat Machine": "Máquina de hack squat", "Hip Abduction Machine": "Máquina de abducción", "Hip Adduction Machine": "Máquina de aducción",
    "Hip Thrust Machine": "Máquina de hip thrust", "Hyperextension Bench": "Banco de hiperextensiones", "Incline Bench": "Banco inclinado",
    "Incline Chest Press Machine": "Máquina de press inclinado", Kettlebell: "Kettlebell", "Lat Pulldown Machine": "Máquina de jalón al pecho",
    "Lateral Raise Machine": "Máquina de elevaciones laterales", "Leg Curl Machine": "Máquina de curl femoral", "Leg Extension Machine": "Máquina de extensión de piernas",
    "Leg Press Machine": "Prensa de piernas", "Medicine Ball": "Balón medicinal", "Mini Resistance Band": "Mini banda elástica",
    "Parallel Dip Bars": "Barras paralelas", "Pec Deck Machine": "Máquina pec deck", "Peck Deck Machine": "Máquina pec deck",
    "Plyo Box": "Cajón pliométrico", "Preacher Bench": "Banco predicador", "Preacher Curl Machine": "Máquina de curl predicador",
    "Pull-up Bar": "Barra de dominadas", "Resistance Band": "Banda elástica", "Rope Attachment": "Cuerda para polea",
    "Seated Calf Raise Machine": "Máquina de gemelos sentado", "Seated Leg Curl Machine": "Máquina de curl femoral sentado",
    "Seated Row Machine": "Máquina de remo sentado", "Shoulder Press Machine": "Máquina de press de hombros",
    "Single Handle Attachment": "Agarre individual", "Single Handle Attachments": "Agarres individuales", "Sliding Discs": "Discos deslizantes",
    "Smith Machine": "Máquina Smith", "Squat Rack": "Rack de sentadillas", "Straight Bar Attachment": "Barra recta para polea",
    "T-Bar Row Machine": "Máquina de remo en T", "Trap Bar": "Barra hexagonal", "Triceps Dip Machine": "Máquina de fondos de tríceps",
    "V-Grip Attachment": "Agarre en V", "Weight Plates": "Discos",
    Bands: "Bandas", Cables: "Poleas", Machines: "Máquinas", "Weight Plate": "Disco",
  },
};

const TABLES: Partial<Record<Language, Record<Group, Record<string, string>>>> = { fr: FR, es: ES };

/** Translate a muscle / equipment / category / difficulty name from the exercise data. Falls back to the English text. */
export function glossary(group: Group, raw: string, language: Language = currentLanguage()): string {
  return TABLES[language]?.[group][raw] ?? raw;
}

/** Same as `glossary`, but re-renders the component when the language changes. */
export function useGlossary() {
  const language = useLanguage();
  return (group: Group, raw: string) => glossary(group, raw, language);
}
