import { GeneratedPlan, QuestionnaireData } from '@/lib/types';
import { buildProgramDesign } from '@/lib/program-design';

const INJURY_MOVEMENT_MAP: Record<string, string[]> = {
  'lower back': ['deadlift', 'bent over row', 'good morning', 'back squat', 'romanian deadlift'],
  'upper back': ['deadlift', 'bent over row', 'lat pulldown'],
  'shoulder': ['overhead press', 'lateral raise', 'upright row', 'dips', 'bench press'],
  'neck': ['shrug', 'upright row', 'overhead press'],
  'elbow': ['tricep extension', 'skull crusher', 'close grip bench', 'bicep curl'],
  'wrist': ['barbell curl', 'push up', 'front squat', 'clean'],
  'hip': ['squat', 'deadlift', 'lunge', 'leg press', 'hip thrust'],
  'knee': ['squat', 'lunge', 'leg extension', 'jump', 'running'],
  'ankle': ['squat', 'calf raise', 'jump', 'running', 'lunge']
};

function normalizeList(items: string[]): string[] {
  const output: string[] = [];
  for (const item of items) {
    item
      .split(/[,\n;]+/)
      .map((value) => value.trim())
      .filter(Boolean)
      .forEach((value) => output.push(value));
  }
  return Array.from(new Set(output));
}

function getRestrictedKeywords(questionnaire: QuestionnaireData): string[] {
  const restricted: string[] = [];

  const addFromMap = (areaText: string) => {
    const areaLower = areaText.toLowerCase();
    for (const [area, movements] of Object.entries(INJURY_MOVEMENT_MAP)) {
      if (areaLower.includes(area)) {
        restricted.push(...movements);
      }
    }
  };

  for (const injury of questionnaire.injuries.currentInjuries) {
    if (injury.severity === 'high') addFromMap(injury.area);
  }

  for (const injury of questionnaire.injuries.pastInjuries) {
    if (injury.severity === 'high') addFromMap(injury.area);
  }

  restricted.push(...questionnaire.injuries.movementRestrictions);
  restricted.push(...questionnaire.injuries.painAreas);

  return Array.from(new Set(restricted.map((r) => r.toLowerCase()).filter(Boolean)));
}

function containsKeyword(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword));
}

function isSportSpecific(questionnaire: QuestionnaireData): boolean {
  if (questionnaire.goals.primaryGoal === 'sport_specific' || questionnaire.goals.secondaryGoal === 'sport_specific') {
    return true;
  }

  const signalText = [
    ...questionnaire.goals.specificTargets,
    questionnaire.experience.recentTraining,
    ...questionnaire.experience.strongPoints,
    ...questionnaire.experience.weakPoints,
    questionnaire.constraints.otherNotes
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return SPORT_SPECIFIC_KEYWORDS.some((keyword) => signalText.includes(keyword));
}

function isPriorityExercise(name: string, priorityKeywords: string[]): boolean {
  if (isPowerExerciseName(name) || isConditioningExerciseName(name)) return true;
  return containsKeyword(name, priorityKeywords);
}

function ensureMaxExercises(
  plan: GeneratedPlan,
  maxExercises: number | null | undefined,
  priorityKeywords: string[] = []
) {
  if (!maxExercises || maxExercises <= 0) return;
  for (const day of plan.days) {
    if (day.exercises.length > maxExercises) {
      const priority: typeof day.exercises = [];
      const others: typeof day.exercises = [];

      for (const exercise of day.exercises) {
        if (isPriorityExercise(exercise.name, priorityKeywords)) {
          priority.push(exercise);
        } else {
          others.push(exercise);
        }
      }

      day.exercises = [...priority, ...others].slice(0, maxExercises);
    }
  }
}

const ACCESSORY_POOL: Record<string, string[]> = {
  upper: ['Cable Row', 'Incline Dumbbell Press', 'Face Pull', 'Lateral Raise', 'Tricep Pushdown', 'Hammer Curl'],
  lower: ['Leg Curl', 'Leg Extension', 'Hip Thrust', 'Split Squat', 'Calf Raise', 'Glute Bridge'],
  push: ['Chest Press', 'Incline Press', 'Overhead Press', 'Lateral Raise', 'Tricep Extension', 'Push-Up'],
  pull: ['Seated Row', 'Lat Pulldown', 'Rear Delt Fly', 'Face Pull', 'Hammer Curl', 'Back Extension'],
  full: ['Goblet Squat', 'Dumbbell Bench Press', 'Lat Pulldown', 'Romanian Deadlift', 'Plank', 'Farmer Carry'],
  core: ['Plank', 'Dead Bug', 'Pallof Press', 'Side Plank', 'Bird Dog', 'Hollow Hold']
};

const MAIN_LIFT_KEYWORDS = [
  'squat',
  'deadlift',
  'bench',
  'press',
  'row',
  'pull-up',
  'pull up',
  'chin',
  'overhead',
  'jump',
  'slam',
  'swing',
  'sprint',
  'power',
  'clean',
  'snatch',
  'med ball',
  'medicine ball',
  'plyo',
  'throw'
];

const SPORT_SPECIFIC_KEYWORDS = [
  'mma',
  'boxing',
  'kickboxing',
  'muay thai',
  'bjj',
  'jiu jitsu',
  'jiu-jitsu',
  'grappling',
  'wrestling',
  'martial',
  'combat',
  'sparring',
  'striking',
  'fight',
  'power',
  'speed',
  'agility'
];

const EXERCISE_VARIATIONS: Record<string, string[]> = {
  squat: ['Front Squat', 'Box Squat', 'Goblet Squat', 'Split Squat', 'Bulgarian Split Squat', 'Leg Press'],
  deadlift: ['Romanian Deadlift', 'Trap Bar Deadlift', 'Sumo Deadlift', 'Single-Leg RDL', 'Hip Thrust'],
  bench: ['Incline Bench Press', 'Dumbbell Bench Press', 'Close-Grip Bench Press', 'Push-Up'],
  row: ['Seated Row', 'Chest-Supported Row', 'Single-Arm Dumbbell Row', 'Lat Pulldown'],
  overhead: ['Dumbbell Shoulder Press', 'Arnold Press', 'Landmine Press', 'Push Press'],
  lunge: ['Reverse Lunge', 'Walking Lunge', 'Step-Up', 'Split Squat'],
  carry: ['Suitcase Carry', 'Overhead Carry', 'Farmer Carry'],
  pullup: ['Pull-Up', 'Chin-Up', 'Assisted Pull-Up', 'Lat Pulldown']
};

const POWER_EXERCISES = [
  'Med Ball Slam',
  'Kettlebell Swing',
  'Box Jump',
  'Broad Jump',
  'Push Press',
  'Explosive Push-Up'
];

const CONDITIONING_EXERCISES = [
  'Sprint Intervals',
  'Jump Rope Intervals',
  'Assault Bike Intervals',
  'Rowing Intervals',
  'Shadowboxing Rounds',
  'Circuit Finisher'
];

const MIXED_EXERCISES = [
  'Shuttle Runs',
  'Battle Rope Slams',
  'Sled Push',
  'Tempo Kettlebell Swings',
  'Burpee Intervals'
];

const POWER_EXERCISE_KEYWORDS = ['power', 'jump', 'slam', 'swing', 'explosive', 'sprint', 'plyo', 'clean', 'snatch'];
const CONDITIONING_EXERCISE_KEYWORDS = ['interval', 'conditioning', 'circuit', 'round', 'sprint', 'bike', 'row', 'jump rope', 'shadowboxing', 'burpee'];

const EQUIPMENT_SWAP_MAP: Array<{
  keywords: string[];
  swap: string;
}> = [
  { keywords: ['bench press'], swap: 'Dumbbell Bench Press' },
  { keywords: ['barbell bench'], swap: 'Push-Up' },
  { keywords: ['squat'], swap: 'Goblet Squat' },
  { keywords: ['deadlift'], swap: 'Hip Hinge (DB/KB)' },
  { keywords: ['leg press'], swap: 'Split Squat' },
  { keywords: ['lat pulldown'], swap: 'Band Lat Pulldown' },
  { keywords: ['cable row'], swap: 'Band Row' },
  { keywords: ['overhead press'], swap: 'Dumbbell Shoulder Press' }
];

function equipmentHints(questionnaire: QuestionnaireData): string {
  const hints = [
    ...(questionnaire.equipment.availableEquipment || []),
    ...(questionnaire.equipment.limitedEquipment || [])
  ];
  return hints.join(' ').toLowerCase();
}

function equipmentSupportsExercise(name: string, questionnaire: QuestionnaireData): boolean {
  const hints = equipmentHints(questionnaire);
  const lower = name.toLowerCase();
  if (lower.includes('row') && !hints.includes('row')) return false;
  if (lower.includes('bike') && !hints.includes('bike')) return false;
  if (lower.includes('med ball') || lower.includes('medicine ball')) {
    if (!hints.includes('med ball') && !hints.includes('medicine ball')) return false;
  }
  if (lower.includes('kettlebell') || lower.includes('kb')) {
    if (!hints.includes('kettlebell') && !hints.includes('kb')) return false;
  }
  if (lower.includes('battle rope') || lower.includes('rope')) {
    if (!hints.includes('rope') && !hints.includes('battle rope') && !hints.includes('jump rope')) return false;
  }
  if (lower.includes('sled')) {
    if (!hints.includes('sled')) return false;
  }
  return true;
}

function pickExerciseOption(
  options: string[],
  questionnaire: QuestionnaireData,
  restricted: string[],
  disliked: string[],
  used: Set<string>
): string | null {
  for (const option of options) {
    const lower = option.toLowerCase();
    if (used.has(lower)) continue;
    if (!equipmentSupportsExercise(option, questionnaire) && !questionnaire.equipment.gymAccess) continue;
    if (containsKeyword(option, restricted) || containsKeyword(option, disliked)) continue;
    return option;
  }
  return null;
}

function applyEquipmentSwap(name: string, questionnaire: QuestionnaireData): string {
  if (questionnaire.equipment.gymAccess) return name;
  const hints = equipmentHints(questionnaire);
  const lower = name.toLowerCase();
  for (const rule of EQUIPMENT_SWAP_MAP) {
    if (rule.keywords.some((keyword) => lower.includes(keyword))) {
      if (lower.includes('squat') && (lower.includes('goblet') || lower.includes('split') || lower.includes('bulgarian') || lower.includes('step-up'))) {
        return name;
      }
      return rule.swap;
    }
  }
  if (hints.includes('no barbell') || hints.includes('no rack')) {
    for (const rule of EQUIPMENT_SWAP_MAP) {
      if (rule.keywords.some((keyword) => lower.includes(keyword))) {
        return rule.swap;
      }
    }
  }
  return name;
}

function rankExercise(name: string): number {
  const lower = name.toLowerCase();
  if (MAIN_LIFT_KEYWORDS.some((keyword) => lower.includes(keyword))) return 0;
  return 1;
}

function reorderExercises(plan: GeneratedPlan) {
  for (const day of plan.days) {
    day.exercises = [...day.exercises].sort((a, b) => rankExercise(a.name) - rankExercise(b.name));
  }
}

type FocusType = 'upper' | 'lower' | 'full';

function getFocusForExercise(name: string): FocusType {
  const lower = name.toLowerCase();
  if (lower.includes('squat') || lower.includes('deadlift') || lower.includes('leg') || lower.includes('lunge') || lower.includes('calf') || lower.includes('glute')) {
    return 'lower';
  }
  if (lower.includes('bench') || lower.includes('row') || lower.includes('press') || lower.includes('pull') || lower.includes('curl') || lower.includes('tricep') || lower.includes('shoulder')) {
    return 'upper';
  }
  return 'full';
}

function getMovementBase(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.includes('squat')) return 'squat';
  if (lower.includes('deadlift') || lower.includes('rdl')) return 'deadlift';
  if (lower.includes('bench')) return 'bench';
  if (lower.includes('row')) return 'row';
  if (lower.includes('overhead') || lower.includes('shoulder press') || lower.includes('press')) return 'overhead';
  if (lower.includes('lunge') || lower.includes('step-up')) return 'lunge';
  if (lower.includes('carry')) return 'carry';
  if (lower.includes('pull-up') || lower.includes('pull up') || lower.includes('chin')) return 'pullup';
  return null;
}

function isPowerExerciseName(name: string): boolean {
  const lower = name.toLowerCase();
  return POWER_EXERCISE_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function isConditioningExerciseName(name: string): boolean {
  const lower = name.toLowerCase();
  return CONDITIONING_EXERCISE_KEYWORDS.some((keyword) => lower.includes(keyword));
}

const TARGET_EXERCISE_MAP: Array<{ keywords: string[]; exercises: string[]; focus: 'upper' | 'lower' | 'full' }> = [
  { keywords: ['bench', 'chest', 'press'], exercises: ['Bench Press', 'Incline Dumbbell Press'], focus: 'upper' },
  { keywords: ['squat', 'leg', 'quads'], exercises: ['Squat', 'Front Squat', 'Leg Press'], focus: 'lower' },
  { keywords: ['deadlift', 'posterior', 'hamstring'], exercises: ['Deadlift', 'Romanian Deadlift'], focus: 'lower' },
  { keywords: ['glute', 'glutes'], exercises: ['Hip Thrust', 'Glute Bridge'], focus: 'lower' },
  { keywords: ['shoulder', 'delts'], exercises: ['Overhead Press', 'Lateral Raise'], focus: 'upper' },
  { keywords: ['back', 'row'], exercises: ['Seated Row', 'Bent Over Row'], focus: 'upper' },
  { keywords: ['pull up', 'pull-up', 'chin'], exercises: ['Pull-Up', 'Lat Pulldown'], focus: 'upper' },
  { keywords: ['arms', 'bicep', 'tricep'], exercises: ['Bicep Curl', 'Tricep Pushdown'], focus: 'upper' },
  { keywords: ['core', 'abs'], exercises: ['Plank', 'Dead Bug'], focus: 'full' },
  { keywords: ['look good', 'aesthetic'], exercises: ['Lateral Raise', 'Cable Fly', 'Bicep Curl'], focus: 'upper' },
  { keywords: ['stronger', 'strength'], exercises: ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press'], focus: 'full' }
];

const WEAK_POINT_MAP: Array<{ keywords: string[]; exercises: string[]; focus: 'upper' | 'lower' | 'full' }> = [
  { keywords: ['core', 'abs', 'midline'], exercises: ['Pallof Press', 'Dead Bug', 'Plank'], focus: 'full' },
  { keywords: ['glute', 'glutes'], exercises: ['Hip Thrust', 'Glute Bridge'], focus: 'lower' },
  { keywords: ['hamstring'], exercises: ['Romanian Deadlift', 'Leg Curl'], focus: 'lower' },
  { keywords: ['quads', 'quad'], exercises: ['Leg Extension', 'Front Squat'], focus: 'lower' },
  { keywords: ['back', 'lats'], exercises: ['Seated Row', 'Lat Pulldown'], focus: 'upper' },
  { keywords: ['shoulder', 'delts'], exercises: ['Lateral Raise', 'Face Pull'], focus: 'upper' },
  { keywords: ['arms', 'bicep', 'tricep'], exercises: ['Bicep Curl', 'Tricep Pushdown'], focus: 'upper' },
  { keywords: ['conditioning', 'cardio', 'engine'], exercises: ['Rowing Intervals', 'Assault Bike Intervals'], focus: 'full' },
  { keywords: ['power', 'speed'], exercises: ['Kettlebell Swing', 'Box Jump'], focus: 'full' }
];

function isTimeBased(reps: string): boolean {
  const lower = reps.toLowerCase();
  return lower.includes('sec') || lower.includes('second') || lower.includes('min') || lower.includes('minute') ||
    lower.includes('max') || lower.includes('amrap');
}

function getSetsForExercise(
  level: QuestionnaireData['experience']['currentLevel'],
  isMain: boolean,
  recovery: QuestionnaireData['recovery']
): number {
  let sets = 3;
  if (level === 'beginner') sets = isMain ? 3 : 2;
  if (level === 'intermediate') sets = isMain ? 4 : 3;
  if (level === 'advanced') sets = isMain ? 5 : 4;

  if (recovery.recoveryCapacity === 'low' || recovery.stressLevel === 'high' || recovery.stressLevel === 'very_high') {
    sets = Math.max(2, sets - 1);
  }

  return sets;
}

function getAccessoryPool(focus: string): string[] {
  const lower = focus.toLowerCase();
  if (lower.includes('upper')) return ACCESSORY_POOL.upper;
  if (lower.includes('lower') || lower.includes('leg')) return ACCESSORY_POOL.lower;
  if (lower.includes('push')) return ACCESSORY_POOL.push;
  if (lower.includes('pull') || lower.includes('back')) return ACCESSORY_POOL.pull;
  if (lower.includes('full')) return ACCESSORY_POOL.full;
  return ACCESSORY_POOL.full;
}

function fillExercisesToExactCount(
  plan: GeneratedPlan,
  questionnaire: QuestionnaireData,
  restrictedKeywords: string[],
  disliked: string[]
) {
  const maxExercises = questionnaire.constraints.maxExercisesPerSession;
  if (!maxExercises || maxExercises <= 0) return;

  const globalUsed = new Set(plan.days.flatMap((day) => day.exercises.map((ex) => ex.name.toLowerCase())));

  for (const day of plan.days) {
    if (day.exercises.length >= maxExercises) continue;

    const pool = getAccessoryPool(day.focus);
    const existingNames = new Set(day.exercises.map((ex) => ex.name.toLowerCase()));
    const candidates = pool.filter(
      (name) =>
        !existingNames.has(name.toLowerCase()) &&
        !globalUsed.has(name.toLowerCase()) &&
        !containsKeyword(name, restrictedKeywords) &&
        !containsKeyword(name, disliked)
    );

    let index = 0;
    while (day.exercises.length < maxExercises && index < candidates.length) {
      const name = candidates[index++];
      day.exercises.push({
        name,
        sets: day.exercises[0]?.sets ?? 3,
        reps: day.exercises[0]?.reps ?? '8-12',
        rest: day.exercises[0]?.rest ?? '90 seconds',
        intent: 'Accessory work to round out the session.',
        rationale: 'Added to complete the workout and increase training volume.',
        notes: 'Use a controlled tempo and focus on form.',
        substitutions: [],
        progressionNote: '📈 Add 2.5kg when completing all sets at top of rep range. Deload 10% after 4 weeks.'
      });
      globalUsed.add(name.toLowerCase());
    }
  }
}

function findDayForFocus(plan: GeneratedPlan, focus: 'upper' | 'lower' | 'full'): number {
  if (focus === 'full') return 0;
  const focusKeyword = focus === 'upper' ? ['upper', 'chest', 'back', 'shoulder', 'arm'] : ['lower', 'leg', 'glute', 'hamstring', 'quad'];
  const idx = plan.days.findIndex((day) =>
    focusKeyword.some((keyword) => day.focus.toLowerCase().includes(keyword))
  );
  return idx === -1 ? 0 : idx;
}

function deriveTargetExercises(targets: string[]): Array<{ name: string; focus: 'upper' | 'lower' | 'full' }> {
  const selected: Array<{ name: string; focus: 'upper' | 'lower' | 'full' }> = [];
  const lowerTargets = targets.map((target) => target.toLowerCase());

  for (const map of TARGET_EXERCISE_MAP) {
    if (map.keywords.some((keyword) => lowerTargets.some((target) => target.includes(keyword)))) {
      for (const exercise of map.exercises) {
        selected.push({ name: exercise, focus: map.focus });
      }
    }
  }

  return selected;
}

function buildMandatoryExercises(questionnaire: QuestionnaireData): Array<{ name: string; focus: FocusType }> {
  const mandatory: Array<{ name: string; focus: FocusType }> = [];
  const goal = questionnaire.goals.primaryGoal;
  const targets = normalizeList(splitList(questionnaire.goals.specificTargets));
  const favourites = normalizeList(splitList(questionnaire.preferences.favouriteExercises));

  if (goal === 'strength' || goal === 'muscle_building') {
    ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press', 'Row', 'Pull-Up'].forEach((exercise) => {
      mandatory.push({ name: exercise, focus: getFocusForExercise(exercise) });
    });
  }

  for (const target of deriveTargetExercises(targets)) {
    mandatory.push(target);
  }

  for (const fav of favourites) {
    mandatory.push({ name: fav, focus: getFocusForExercise(fav) });
  }

  return mandatory;
}

function ensureMandatoryExercises(
  plan: GeneratedPlan,
  questionnaire: QuestionnaireData,
  restricted: string[],
  disliked: string[],
  maxExercises: number | null | undefined
) {
  const mandatory = buildMandatoryExercises(questionnaire);
  if (mandatory.length === 0) return;

  for (const item of mandatory) {
    const resolvedName = applyEquipmentSwap(item.name, questionnaire);
    const already = plan.days.some((day) =>
      day.exercises.some((ex) => ex.name.toLowerCase().includes(resolvedName.toLowerCase()))
    );
    if (already) continue;
    if (containsKeyword(resolvedName, restricted) || containsKeyword(resolvedName, disliked)) continue;

    const dayIndex = findDayForFocus(plan, item.focus);
    const day = plan.days[dayIndex];
    const template = day.exercises[0];
    const exercise = {
      name: resolvedName,
      sets: template?.sets ?? 3,
      reps: template?.reps ?? '6-10',
      rest: template?.rest ?? '90 seconds',
      intent: 'Core lift selected to match your goals and targets.',
      rationale: `Selected as a core compound movement to align with your ${item.focus} training focus.`,
      notes: template?.notes ?? 'Use controlled form and progressive overload.',
      substitutions: template?.substitutions ?? [],
      progressionNote: template?.progressionNote && template.progressionNote.length >= 20 ? template.progressionNote : '📈 Add 2.5kg when completing 3 sets at top of rep range. Deload 10% every 4-6 weeks.'
    };

    if (maxExercises && day.exercises.length >= maxExercises) {
      day.exercises[day.exercises.length - 1] = exercise;
    } else {
      day.exercises.push(exercise);
    }
  }
}

function ensureTargetExercises(
  plan: GeneratedPlan,
  targets: string[],
  restrictedKeywords: string[],
  disliked: string[],
  maxExercises: number | null | undefined
) {
  if (targets.length === 0) return;
  const desired = deriveTargetExercises(targets);
  if (desired.length === 0) return;

  for (const target of desired) {
    const already = plan.days.some((day) =>
      day.exercises.some((ex) => ex.name.toLowerCase().includes(target.name.toLowerCase()))
    );
    if (already) continue;
    if (containsKeyword(target.name, restrictedKeywords) || containsKeyword(target.name, disliked)) {
      continue;
    }

    const dayIndex = findDayForFocus(plan, target.focus);
    const day = plan.days[dayIndex];
    const template = day.exercises[0];
    const targetExercise = {
      name: target.name,
      sets: template?.sets ?? 3,
      reps: template?.reps ?? '6-10',
      rest: template?.rest ?? '90 seconds',
      intent: 'Included to directly address your stated targets.',
      rationale: `Specifically chosen to target ${target.name} as mentioned in your specific goals.`,
      notes: template?.notes ?? 'Use a controlled tempo and focus on form.',
      substitutions: template?.substitutions ?? [],
      progressionNote: template?.progressionNote && template.progressionNote.length >= 20 ? template.progressionNote : '📈 Add 1-2 reps per session, then increase weight by 2.5kg and reset reps. Deload every 4 weeks.'
    };

    if (maxExercises && day.exercises.length >= maxExercises) {
      day.exercises[day.exercises.length - 1] = targetExercise;
    } else {
      day.exercises.push(targetExercise);
    }
  }
}

function applyProgramDesign(
  plan: GeneratedPlan,
  questionnaire: QuestionnaireData
) {
  const design = buildProgramDesign(questionnaire);
  for (const day of plan.days) {
    day.exercises = day.exercises.map((exercise, idx) => {
      const isMain = idx < 2;
      const name = applyEquipmentSwap(exercise.name, questionnaire);
      const preserve = isPowerExerciseName(name) || isConditioningExerciseName(name);
      const sets = preserve
        ? exercise.sets
        : getSetsForExercise(questionnaire.experience.currentLevel, isMain, questionnaire.recovery);
      const reps = preserve
        ? exercise.reps
        : (isTimeBased(exercise.reps)
          ? exercise.reps
          : (isMain ? design.mainRepRange : design.accessoryRepRange));
      const rest = preserve
        ? exercise.rest
        : (isTimeBased(exercise.reps)
          ? exercise.rest
          : (isMain ? design.restMain : design.restAccessory));

      return {
        ...exercise,
        name,
        sets,
        reps,
        rest
      };
    });
  }
}

function removeDislikedExercises(plan: GeneratedPlan, disliked: string[]) {
  if (disliked.length === 0) return;
  for (const day of plan.days) {
    day.exercises = day.exercises.filter((exercise) => !containsKeyword(exercise.name, disliked));
  }
}

function includeFavouriteExercises(
  plan: GeneratedPlan,
  favourites: string[],
  restrictedKeywords: string[],
  maxExercises: number | null | undefined
) {
  if (favourites.length === 0) return;

  const remaining = favourites.filter((fav) => !containsKeyword(fav, restrictedKeywords));
  if (remaining.length === 0) return;

  let dayIndex = 0;
  for (const fav of remaining) {
    const already = plan.days.some((day) =>
      day.exercises.some((ex) => ex.name.toLowerCase().includes(fav.toLowerCase()))
    );
    if (already) continue;

    const day = plan.days[dayIndex % plan.days.length];
    dayIndex += 1;

    const template = day.exercises[0];
    const favExercise = {
      name: fav,
      sets: template?.sets ?? 3,
      reps: template?.reps ?? '8-12',
      rest: template?.rest ?? '90 seconds',
      intent: 'Included because it is one of your favourite exercises.',
      rationale: 'Maintained as a favorite exercise to support adherence and enjoyment.',
      notes: template?.notes ?? 'Adjust load and form to your comfort and equipment.',
      substitutions: template?.substitutions ?? [],
      progressionNote: template?.progressionNote && template.progressionNote.length >= 20 ? template.progressionNote : '📈 Track weights; aim to add 1-2 reps or 1-2.5kg each week. Deload when form breaks down.'
    };

    if (maxExercises && day.exercises.length >= maxExercises) {
      day.exercises[day.exercises.length - 1] = favExercise;
    } else {
      day.exercises.push(favExercise);
    }
  }
}

function buildNutritionNotes(questionnaire: QuestionnaireData): string {
  const approach = questionnaire.nutrition.nutritionApproach;
  const protein = questionnaire.nutrition.proteinIntake;
  const restrictions = questionnaire.nutrition.dietaryRestrictions;
  const supplements = questionnaire.nutrition.supplementUse;

  const calorieGuidance = (() => {
    switch (approach) {
      case 'surplus':
        return 'Aim for a 5-10% surplus (~250-300 kcal above maintenance).';
      case 'deficit':
        return 'Aim for a 10-20% deficit (~300-500 kcal below maintenance).';
      case 'intuitive':
        return 'Use portion control and hunger cues; keep intake consistent day to day.';
      case 'maintenance':
      default:
        return 'Start around maintenance (bodyweight x 14-16 kcal/lb or 30-35 kcal/kg), then adjust by +/-100-200 kcal based on weekly trend.';
    }
  })();

  const proteinGuidance = (() => {
    switch (protein) {
      case 'low':
        return 'Protein target: ~1.2-1.6 g/kg (0.55-0.7 g/lb).';
      case 'moderate':
        return 'Protein target: ~1.6-1.8 g/kg (0.7-0.8 g/lb).';
      case 'high':
        return 'Protein target: ~1.8-2.2 g/kg (0.8-1.0 g/lb).';
      case 'very_high':
        return 'Protein target: ~2.2-2.6 g/kg (1.0-1.2 g/lb).';
      default:
        return 'Protein target: ~1.6-2.2 g/kg (0.7-1.0 g/lb).';
    }
  })();

  const timingGuidance = 'Include protein in 3-4 meals; add a light pre-workout snack (carbs + protein) 60-90 min before and a post-workout meal within 1-2 hours.';

  const restrictionNote = restrictions.length ? ` Restrictions: ${restrictions.join(', ')}.` : '';
  const supplementNote = supplements.length ? ` Supplements: ${supplements.join(', ')}.` : '';

  return `Nutrition: ${approach}. ${calorieGuidance} ${proteinGuidance} ${timingGuidance}${restrictionNote}${supplementNote}`.trim();
}

function diversifyExercisesAcrossDays(
  plan: GeneratedPlan,
  restricted: string[],
  disliked: string[],
  favourites: string[]
) {
  const usedByBase = new Map<string, Set<string>>();
  const favouriteKeywords = favourites.map((fav) => fav.toLowerCase()).filter(Boolean);

  for (const day of plan.days) {
    for (const exercise of day.exercises) {
      const base = getMovementBase(exercise.name);
      if (!base) continue;

      const nameLower = exercise.name.toLowerCase();
      const used = usedByBase.get(base) ?? new Set<string>();

      if (!used.has(nameLower)) {
        used.add(nameLower);
        usedByBase.set(base, used);
        continue;
      }

      if (containsKeyword(exercise.name, favouriteKeywords)) {
        continue;
      }

      const variations = EXERCISE_VARIATIONS[base] || [];
      const replacement = variations.find((candidate) => {
        const candidateLower = candidate.toLowerCase();
        if (used.has(candidateLower)) return false;
        if (containsKeyword(candidate, restricted) || containsKeyword(candidate, disliked)) return false;
        return true;
      });

      if (replacement) {
        exercise.name = replacement;
        used.add(replacement.toLowerCase());
        usedByBase.set(base, used);
      }
    }
  }
}

type SportDayTemplate = {
  name: string;
  focus: string;
  type: 'power' | 'conditioning' | 'mixed' | 'strength';
};

function getSportDayTemplates(days: number): SportDayTemplate[] {
  const templates: SportDayTemplate[] = [
    { name: 'Power + Strength', focus: 'Power/Strength', type: 'power' },
    { name: 'Conditioning / Engine', focus: 'Conditioning', type: 'conditioning' },
    { name: 'Mixed Strength + Conditioning', focus: 'Mixed', type: 'mixed' },
    { name: 'Speed + Power', focus: 'Power/Speed', type: 'power' },
    { name: 'Aerobic Base + Mobility', focus: 'Conditioning', type: 'conditioning' }
  ];

  return Array.from({ length: days }, (_, idx) => templates[idx % templates.length]);
}

function buildSportExercise(
  name: string,
  intent: string,
  notes: string,
  reps: string,
  rest: string
) {
  return {
    name,
    sets: 3,
    reps,
    rest,
    intent,
    rationale: intent, // Fallback: use intent as rationale if not provided by AI
    notes,
    substitutions: [],
    progressionNote: '📈 Progress when movement feels controlled. Add duration/reps by 10% every 2 weeks.'
  };
}

function replaceOrAppendExercise(
  day: GeneratedPlan['days'][number],
  exercise: GeneratedPlan['days'][number]['exercises'][number],
  maxExercises: number | null | undefined,
  protectedKeywords: string[]
) {
  if (!maxExercises || day.exercises.length < maxExercises) {
    day.exercises.push(exercise);
    return;
  }

  let replaceIndex = -1;
  for (let i = day.exercises.length - 1; i >= 0; i -= 1) {
    if (!containsKeyword(day.exercises[i].name, protectedKeywords)) {
      replaceIndex = i;
      break;
    }
  }

  if (replaceIndex === -1) {
    replaceIndex = day.exercises.length - 1;
  }

  day.exercises[replaceIndex] = exercise;
}

function applyPreferredDayLabels(plan: GeneratedPlan, questionnaire: QuestionnaireData) {
  const preferredDays = questionnaire.availability.preferredDays;
  if (!preferredDays || preferredDays.length === 0) return;

  const labels = preferredDays.slice(0, plan.days.length);
  if (labels.length === 0) return;

  for (let i = 0; i < plan.days.length; i += 1) {
    const label = labels[i];
    if (!label) continue;
    const baseName = plan.days[i].name || `Day ${i + 1}`;
    if (!baseName.toLowerCase().includes(label.toLowerCase())) {
      plan.days[i].name = `${label} - ${baseName}`;
    }
  }
}

function ensureWeakPointExercises(
  plan: GeneratedPlan,
  questionnaire: QuestionnaireData,
  restricted: string[],
  disliked: string[],
  maxExercises: number | null | undefined
) {
  const weakPoints = normalizeList(splitList(questionnaire.experience.weakPoints));
  if (weakPoints.length === 0) return;

  const protectedKeywords = questionnaire.preferences.favouriteExercises.map((fav) => fav.toLowerCase()).filter(Boolean);
  const lowerWeak = weakPoints.map((point) => point.toLowerCase());
  const used = new Set(plan.days.flatMap((day) => day.exercises.map((ex) => ex.name.toLowerCase())));

  for (const map of WEAK_POINT_MAP) {
    if (!map.keywords.some((keyword) => lowerWeak.some((weak) => weak.includes(keyword)))) continue;

    const option = pickExerciseOption(map.exercises, questionnaire, restricted, disliked, used);
    if (!option) continue;

    const dayIndex = findDayForFocus(plan, map.focus);
    const day = plan.days[dayIndex];
    const template = day.exercises[0];
    const exercise = {
      name: option,
      sets: template?.sets ?? 3,
      reps: template?.reps ?? '8-12',
      rest: template?.rest ?? '60-90 sec',
      intent: 'Included to address a stated weak point.',
      rationale: 'Specifically targeting your identified weak point for balanced development.',
      notes: template?.notes ?? 'Use a controlled tempo and full range of motion.',
      substitutions: [],
      progressionNote: template?.progressionNote && template.progressionNote.length >= 20 ? template.progressionNote : '📈 Increase reps or weight by 5-10% when all sets complete with good form. Deload every 4 weeks.'
    };

    replaceOrAppendExercise(day, exercise, maxExercises, protectedKeywords);
    used.add(option.toLowerCase());
  }
}

function ensureCardioFinishers(
  plan: GeneratedPlan,
  questionnaire: QuestionnaireData,
  restricted: string[],
  disliked: string[],
  maxExercises: number | null | undefined
) {
  const preference = questionnaire.preferences.cardioPreference;
  if (preference === 'none') return;

  const desired = preference === 'minimal'
    ? 1
    : (preference === 'moderate' ? 2 : Math.min(plan.days.length, 3));

  const currentCount = plan.days.reduce((count, day) => {
    return count + (day.exercises.some((exercise) => isConditioningExerciseName(exercise.name)) ? 1 : 0);
  }, 0);

  if (currentCount >= desired) return;

  const protectedKeywords = questionnaire.preferences.favouriteExercises.map((fav) => fav.toLowerCase()).filter(Boolean);
  const used = new Set(plan.days.flatMap((day) => day.exercises.map((ex) => ex.name.toLowerCase())));

  let added = 0;
  for (const day of plan.days) {
    if (day.exercises.some((exercise) => isConditioningExerciseName(exercise.name))) {
      continue;
    }

    const option = pickExerciseOption(CONDITIONING_EXERCISES, questionnaire, restricted, disliked, used)
      || pickExerciseOption(MIXED_EXERCISES, questionnaire, restricted, disliked, used);
    if (!option) continue;

    const exercise = buildSportExercise(
      option,
      'Conditioning finisher aligned with your cardio preference.',
      'Stay smooth and consistent as fatigue builds.',
      '30-45 sec',
      '45-60 sec'
    );

    replaceOrAppendExercise(day, exercise, maxExercises, protectedKeywords);
    used.add(option.toLowerCase());
    added += 1;
    if (currentCount + added >= desired) break;
  }
}

function applySportSpecificStructure(
  plan: GeneratedPlan,
  questionnaire: QuestionnaireData,
  restricted: string[],
  disliked: string[],
  favourites: string[],
  maxExercises: number | null | undefined
) {
  if (!isSportSpecific(questionnaire)) return;

  const templates = getSportDayTemplates(plan.days.length);
  const protectedKeywords = favourites.map((fav) => fav.toLowerCase()).filter(Boolean);
  const used = new Set(plan.days.flatMap((day) => day.exercises.map((ex) => ex.name.toLowerCase())));
  const respectSplit = Boolean(questionnaire.preferences.preferredSplit);

  plan.days.forEach((day, idx) => {
    const template = templates[idx];
    if (!respectSplit) {
      day.name = template.name;
      day.focus = template.focus;
    }

    const powerCount = day.exercises.filter((exercise) => isPowerExerciseName(exercise.name)).length;
    const conditioningCount = day.exercises.filter((exercise) => isConditioningExerciseName(exercise.name)).length;
    const desiredPower = template.type === 'power' || template.type === 'mixed' ? 1 : 0;
    const desiredConditioning = template.type === 'conditioning'
      ? 2
      : (template.type === 'mixed' ? 1 : 0);

    for (let i = powerCount; i < desiredPower; i += 1) {
      const option = pickExerciseOption(POWER_EXERCISES, questionnaire, restricted, disliked, used);
      if (option) {
        const exercise = buildSportExercise(
          option,
          'Develop explosive power for sport performance.',
          'Focus on speed and crisp technique.',
          '3-5 reps',
          '90-120 sec'
        );
        replaceOrAppendExercise(day, exercise, maxExercises, protectedKeywords);
        used.add(option.toLowerCase());
      }
    }

    for (let i = conditioningCount; i < desiredConditioning; i += 1) {
      const option = pickExerciseOption(MIXED_EXERCISES, questionnaire, restricted, disliked, used)
        || pickExerciseOption(CONDITIONING_EXERCISES, questionnaire, restricted, disliked, used);
      if (option) {
        const exercise = buildSportExercise(
          option,
          'Build fight-specific conditioning and engine.',
          'Work at hard but sustainable pace.',
          '30-45 sec',
          '45-75 sec'
        );
        replaceOrAppendExercise(day, exercise, maxExercises, protectedKeywords);
        used.add(option.toLowerCase());
      }
    }
  });
}

function appendIfMissing(base: string, addition: string, keywords: string[]): string {
  if (!addition.trim()) return base;
  const lower = base.toLowerCase();
  const missing = keywords.some((keyword) => !lower.includes(keyword));
  if (!missing) return base;
  return `${base.trim()} ${addition.trim()}`.trim();
}

function buildPersonalizationSnippet(questionnaire: QuestionnaireData): string {
  const schedule = `${questionnaire.availability.daysPerWeek} days/week, ${questionnaire.availability.sessionDuration} min`;
  const fav = questionnaire.preferences.favouriteExercises[0];
  const weak = questionnaire.experience.weakPoints[0];
  const equipment = questionnaire.equipment.gymAccess ? 'gym-based' : 'home-based';
  const cardio = questionnaire.preferences.cardioPreference;

  const parts = [
    `Built for your ${schedule} schedule`,
    fav ? `includes ${fav}` : '',
    weak ? `addresses ${weak}` : '',
    `cardio preference: ${cardio}`,
    `equipment: ${equipment}`
  ].filter(Boolean);

  return parts.slice(0, 3).join('; ') + '.';
}

function splitList(items: string[]): string[] {
  return items
    .flatMap((item) => item.split(/[,\n;]+/))
    .map((item) => item.trim())
    .filter(Boolean);
}

function getPreferredSplitLabel(split: QuestionnaireData['preferences']['preferredSplit']): string | null {
  if (!split) return null;
  switch (split) {
    case 'full_body':
      return 'Full Body split';
    case 'upper_lower':
      return 'Upper/Lower split';
    case 'push_pull_legs':
      return 'Push/Pull/Legs split';
    case 'bro_split':
      return 'Bro split';
    case 'custom':
      return 'Custom split';
    default:
      return null;
  }
}

export function recommendSplit(questionnaire: QuestionnaireData): string {
  const preferred = getPreferredSplitLabel(questionnaire.preferences.preferredSplit);
  if (preferred) return preferred;

  const days = questionnaire.availability.daysPerWeek;
  const recovery = questionnaire.recovery.recoveryCapacity;
  const level = questionnaire.experience.currentLevel;
  const goal = questionnaire.goals.primaryGoal;

  if (days <= 2) {
    return 'Full Body split (2 days)';
  }

  if (days === 3) {
    return level === 'beginner' || recovery === 'low'
      ? 'Full Body split (3 days)'
      : 'Full Body split (3 days)';
  }

  if (days === 4) {
    return 'Upper/Lower split (4 days)';
  }

  if (days === 5) {
    if (recovery === 'high' && level !== 'beginner') {
      return 'Push/Pull/Legs + Upper/Lower (5 days)';
    }
    return 'Upper/Lower split (4 days) + conditioning';
  }

  if (days >= 6) {
    return recovery === 'high' ? 'Push/Pull/Legs (6 days)' : 'Upper/Lower split (4-5 days)';
  }

  if (goal === 'endurance' || goal === 'fat_loss') {
    return 'Full Body + conditioning';
  }

  return 'Full Body split';
}

export function normalizePlan(
  plan: GeneratedPlan,
  questionnaire: QuestionnaireData
): GeneratedPlan {
  const maxExercises = questionnaire.constraints.maxExercisesPerSession;
  const favourites = normalizeList(splitList(questionnaire.preferences.favouriteExercises));
  const disliked = normalizeList(splitList(questionnaire.preferences.dislikedExercises));
  const restricted = getRestrictedKeywords(questionnaire);
  const targetList = normalizeList(splitList(questionnaire.goals.specificTargets));

  if (questionnaire.availability.daysPerWeek && plan.days.length > questionnaire.availability.daysPerWeek) {
    plan.days = plan.days.slice(0, questionnaire.availability.daysPerWeek);
  }

  removeDislikedExercises(plan, disliked);
  ensureMandatoryExercises(plan, questionnaire, restricted, disliked, maxExercises);
  ensureTargetExercises(plan, targetList, restricted, disliked, maxExercises);
  includeFavouriteExercises(plan, favourites, restricted, maxExercises);
  applySportSpecificStructure(plan, questionnaire, restricted, disliked, favourites, maxExercises);
  ensureWeakPointExercises(plan, questionnaire, restricted, disliked, maxExercises);
  ensureCardioFinishers(plan, questionnaire, restricted, disliked, maxExercises);
  diversifyExercisesAcrossDays(plan, restricted, disliked, favourites);
  fillExercisesToExactCount(plan, questionnaire, restricted, disliked);
  ensureMaxExercises(plan, maxExercises, [...favourites, ...targetList]);

  plan.nutritionNotes = buildNutritionNotes(questionnaire);

  const recoverySummary = `Recovery: ${questionnaire.recovery.sleepHours}h sleep (${questionnaire.recovery.sleepQuality}), stress ${questionnaire.recovery.stressLevel.replace('_', ' ')}, recovery capacity ${questionnaire.recovery.recoveryCapacity}.`;
  plan.recoveryNotes = recoverySummary;

  const targetSummary = questionnaire.goals.specificTargets.length
    ? `Specific targets: ${questionnaire.goals.specificTargets.join(', ')}.`
    : '';
  const goalsSummary = `Goals: ${questionnaire.goals.primaryGoal.replace('_', ' ')}` +
    (questionnaire.goals.secondaryGoal ? ` + ${questionnaire.goals.secondaryGoal.replace('_', ' ')}` : '') +
    ` over ${questionnaire.goals.timeframe}. ${targetSummary}`;

  plan.overview = appendIfMissing(plan.overview, goalsSummary, [
    questionnaire.goals.primaryGoal.replace('_', ' '),
    questionnaire.goals.timeframe
  ]);
  plan.overview = appendIfMissing(plan.overview, buildPersonalizationSnippet(questionnaire), [
    'days/week',
    'cardio'
  ]);

  const preferredSplitLabel = getPreferredSplitLabel(questionnaire.preferences.preferredSplit);
  if (preferredSplitLabel) {
    plan.weeklyStructure = preferredSplitLabel;
  } else if (isSportSpecific(questionnaire)) {
    plan.weeklyStructure = `Sport-specific split (${plan.days.length} days: power, conditioning, mixed)`;
  } else {
    plan.weeklyStructure = recommendSplit(questionnaire);
  }

  const design = buildProgramDesign(questionnaire);
  plan.progressionGuidance = `${design.progressionModel} ${design.deloadGuidance} Main lifts use ${design.mainRepRange} reps with ${design.restMain} rest; accessories use ${design.accessoryRepRange} reps with ${design.restAccessory} rest. ${design.recoveryModifier}`;

  applyPreferredDayLabels(plan, questionnaire);
  reorderExercises(plan);
  applyProgramDesign(plan, questionnaire);

  return plan;
}
