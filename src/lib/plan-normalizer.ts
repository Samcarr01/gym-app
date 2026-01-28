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

function ensureMaxExercises(plan: GeneratedPlan, maxExercises: number | null | undefined) {
  if (!maxExercises || maxExercises <= 0) return;
  for (const day of plan.days) {
    if (day.exercises.length > maxExercises) {
      day.exercises = day.exercises.slice(0, maxExercises);
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

  for (const day of plan.days) {
    if (day.exercises.length >= maxExercises) continue;

    const pool = getAccessoryPool(day.focus);
    const existingNames = new Set(day.exercises.map((ex) => ex.name.toLowerCase()));
    const candidates = pool.filter(
      (name) =>
        !existingNames.has(name.toLowerCase()) &&
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
        notes: 'Use a controlled tempo and focus on form.',
        substitutions: []
      });
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
      notes: template?.notes ?? 'Use a controlled tempo and focus on form.',
      substitutions: template?.substitutions ?? []
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
      const sets = getSetsForExercise(questionnaire.experience.currentLevel, isMain, questionnaire.recovery);
      const reps = isTimeBased(exercise.reps)
        ? exercise.reps
        : (isMain ? design.mainRepRange : design.accessoryRepRange);
      const rest = isTimeBased(exercise.reps)
        ? exercise.rest
        : (isMain ? design.restMain : design.restAccessory);

      return {
        ...exercise,
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
      notes: template?.notes ?? 'Adjust load and form to your comfort and equipment.',
      substitutions: template?.substitutions ?? []
    };

    if (maxExercises && day.exercises.length >= maxExercises) {
      day.exercises[day.exercises.length - 1] = favExercise;
    } else {
      day.exercises.push(favExercise);
    }
  }
}

function appendIfMissing(base: string, addition: string, keywords: string[]): string {
  if (!addition.trim()) return base;
  const lower = base.toLowerCase();
  const missing = keywords.some((keyword) => !lower.includes(keyword));
  if (!missing) return base;
  return `${base.trim()} ${addition.trim()}`.trim();
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
  ensureTargetExercises(plan, targetList, restricted, disliked, maxExercises);
  includeFavouriteExercises(plan, favourites, restricted, maxExercises);
  fillExercisesToExactCount(plan, questionnaire, restricted, disliked);
  ensureMaxExercises(plan, maxExercises);

  const nutritionSummary = `Nutrition: ${questionnaire.nutrition.nutritionApproach}, protein ${questionnaire.nutrition.proteinIntake}.` +
    (questionnaire.nutrition.dietaryRestrictions.length ? ` Restrictions: ${questionnaire.nutrition.dietaryRestrictions.join(', ')}.` : '') +
    (questionnaire.nutrition.supplementUse.length ? ` Supplements: ${questionnaire.nutrition.supplementUse.join(', ')}.` : '');

  plan.nutritionNotes = nutritionSummary;

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

  const preferredSplitLabel = getPreferredSplitLabel(questionnaire.preferences.preferredSplit);
  if (preferredSplitLabel) {
    plan.weeklyStructure = preferredSplitLabel;
  } else {
    plan.weeklyStructure = recommendSplit(questionnaire);
  }

  const design = buildProgramDesign(questionnaire);
  plan.progressionGuidance = `${design.progressionModel} ${design.deloadGuidance} Main lifts use ${design.mainRepRange} reps with ${design.restMain} rest; accessories use ${design.accessoryRepRange} reps with ${design.restAccessory} rest. ${design.recoveryModifier}`;

  applyProgramDesign(plan, questionnaire);

  return plan;
}
