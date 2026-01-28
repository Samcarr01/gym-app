import { GeneratedPlan, QuestionnaireData } from '@/lib/types';

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

  const target = Math.max(1, Math.min(favourites.length, plan.days.length));
  const remaining = [...favourites];
  let includedCount = 0;

  for (const day of plan.days) {
    if (includedCount >= target) break;
    const alreadyHasFavourite = day.exercises.some((ex) =>
      remaining.some((fav) => ex.name.toLowerCase().includes(fav.toLowerCase()))
    );
    if (alreadyHasFavourite) {
      includedCount += 1;
      continue;
    }

    const nextFavIndex = remaining.findIndex(
      (fav) => !containsKeyword(fav, restrictedKeywords)
    );
    if (nextFavIndex === -1) continue;

    const fav = remaining.splice(nextFavIndex, 1)[0];
    const template = day.exercises[0];

    const favExercise = {
      name: fav,
      sets: template?.sets ?? 3,
      reps: template?.reps ?? '8-12',
      rest: template?.rest ?? '90 seconds',
      intent: `Included because it is one of your favourite exercises.`,
      notes: template?.notes ?? 'Adjust load and form to your comfort and equipment.',
      substitutions: template?.substitutions ?? []
    };

    if (maxExercises && day.exercises.length >= maxExercises) {
      day.exercises[day.exercises.length - 1] = favExercise;
    } else {
      day.exercises.push(favExercise);
    }
    includedCount += 1;
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

export function normalizePlan(
  plan: GeneratedPlan,
  questionnaire: QuestionnaireData
): GeneratedPlan {
  const maxExercises = questionnaire.constraints.maxExercisesPerSession;
  const favourites = normalizeList(splitList(questionnaire.preferences.favouriteExercises));
  const disliked = normalizeList(splitList(questionnaire.preferences.dislikedExercises));
  const restricted = getRestrictedKeywords(questionnaire);

  if (questionnaire.availability.daysPerWeek && plan.days.length > questionnaire.availability.daysPerWeek) {
    plan.days = plan.days.slice(0, questionnaire.availability.daysPerWeek);
  }

  removeDislikedExercises(plan, disliked);
  includeFavouriteExercises(plan, favourites, restricted, maxExercises);
  fillExercisesToExactCount(plan, questionnaire, restricted, disliked);
  ensureMaxExercises(plan, maxExercises);

  const nutritionSummary = `Nutrition: ${questionnaire.nutrition.nutritionApproach}, protein ${questionnaire.nutrition.proteinIntake}.` +
    (questionnaire.nutrition.dietaryRestrictions.length ? ` Restrictions: ${questionnaire.nutrition.dietaryRestrictions.join(', ')}.` : '') +
    (questionnaire.nutrition.supplementUse.length ? ` Supplements: ${questionnaire.nutrition.supplementUse.join(', ')}.` : '');

  plan.nutritionNotes = nutritionSummary;

  const recoverySummary = `Recovery: ${questionnaire.recovery.sleepHours}h sleep (${questionnaire.recovery.sleepQuality}), stress ${questionnaire.recovery.stressLevel.replace('_', ' ')}, recovery capacity ${questionnaire.recovery.recoveryCapacity}.`;
  plan.recoveryNotes = recoverySummary;

  const targets = questionnaire.goals.specificTargets.length
    ? `Specific targets: ${questionnaire.goals.specificTargets.join(', ')}.`
    : '';
  const goalsSummary = `Goals: ${questionnaire.goals.primaryGoal.replace('_', ' ')}` +
    (questionnaire.goals.secondaryGoal ? ` + ${questionnaire.goals.secondaryGoal.replace('_', ' ')}` : '') +
    ` over ${questionnaire.goals.timeframe}. ${targets}`;

  plan.overview = appendIfMissing(plan.overview, goalsSummary, [
    questionnaire.goals.primaryGoal.replace('_', ' '),
    questionnaire.goals.timeframe
  ]);

  const preferredSplitLabel = getPreferredSplitLabel(questionnaire.preferences.preferredSplit);
  if (preferredSplitLabel) {
    plan.weeklyStructure = preferredSplitLabel;
  }

  return plan;
}
