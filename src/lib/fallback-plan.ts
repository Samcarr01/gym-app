import {
  GeneratedPlan,
  QuestionnaireData,
  WorkoutDay,
  Exercise
} from '@/lib/types';

type DayType = 'full_body' | 'upper' | 'lower' | 'push' | 'pull' | 'legs';

type ExerciseTemplate = {
  name: string;
  movement: string;
  intent: string;
  notes: string;
  substitutions: string[];
};

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

const GYM_TEMPLATES: Record<DayType, ExerciseTemplate[]> = {
  full_body: [
    { name: 'Goblet Squat', movement: 'squat', intent: 'Build lower-body strength safely', notes: 'Keep torso tall and control depth', substitutions: ['Leg Press', 'Box Squat'] },
    { name: 'Dumbbell Bench Press', movement: 'push', intent: 'Develop pressing strength and chest musculature', notes: 'Use a full, controlled range', substitutions: ['Machine Chest Press', 'Push-Up'] },
    { name: 'Lat Pulldown', movement: 'pull', intent: 'Train back and lats for posture and strength', notes: 'Pull elbows to ribs, avoid swinging', substitutions: ['Assisted Pull-Up', 'Seated Cable Row'] },
    { name: 'Romanian Deadlift', movement: 'hinge', intent: 'Strengthen posterior chain', notes: 'Hinge at hips, keep back neutral', substitutions: ['Hip Hinge with DBs', 'Back Extension'] },
    { name: 'Plank', movement: 'core', intent: 'Build core stability', notes: 'Brace abs and keep body aligned', substitutions: ['Dead Bug', 'Pallof Press'] }
  ],
  upper: [
    { name: 'Dumbbell Bench Press', movement: 'push', intent: 'Primary upper-body press', notes: 'Elbows 30–45° from torso', substitutions: ['Machine Chest Press', 'Push-Up'] },
    { name: 'Seated Cable Row', movement: 'pull', intent: 'Build mid-back strength', notes: 'Pause and squeeze shoulder blades', substitutions: ['Chest-Supported Row', 'One-Arm DB Row'] },
    { name: 'Overhead Press', movement: 'push', intent: 'Develop shoulders and triceps', notes: 'Brace core, press straight up', substitutions: ['Seated DB Press', 'Machine Shoulder Press'] },
    { name: 'Lat Pulldown', movement: 'pull', intent: 'Train lats for width and strength', notes: 'Control the eccentric', substitutions: ['Assisted Pull-Up', 'Band Lat Pulldown'] },
    { name: 'Bicep Curl', movement: 'curl', intent: 'Accessory arm work', notes: 'Avoid swinging', substitutions: ['Hammer Curl', 'Cable Curl'] }
  ],
  lower: [
    { name: 'Leg Press', movement: 'squat', intent: 'Develop quads and glutes with stability', notes: 'Keep knees tracking over toes', substitutions: ['Goblet Squat', 'Box Squat'] },
    { name: 'Romanian Deadlift', movement: 'hinge', intent: 'Posterior chain strength', notes: 'Hinge at hips, soft knees', substitutions: ['Hip Hinge with DBs', 'Back Extension'] },
    { name: 'Walking Lunge', movement: 'lunge', intent: 'Unilateral leg strength and balance', notes: 'Short steps to reduce knee stress', substitutions: ['Split Squat', 'Step-Up'] },
    { name: 'Leg Curl', movement: 'hamstring', intent: 'Hamstring isolation', notes: 'Control the negative', substitutions: ['Stability Ball Curl', 'Nordic Curl (assisted)'] },
    { name: 'Calf Raise', movement: 'calf', intent: 'Calf strength and ankle stability', notes: 'Pause at top and bottom', substitutions: ['Seated Calf Raise', 'Single-Leg Calf Raise'] }
  ],
  push: [
    { name: 'Bench Press', movement: 'push', intent: 'Primary chest press', notes: 'Feet planted, control descent', substitutions: ['Dumbbell Bench Press', 'Machine Chest Press'] },
    { name: 'Incline Dumbbell Press', movement: 'push', intent: 'Upper chest focus', notes: 'Keep wrists neutral', substitutions: ['Incline Machine Press', 'Push-Up (feet elevated)'] },
    { name: 'Overhead Press', movement: 'push', intent: 'Shoulder strength', notes: 'Avoid excessive arch', substitutions: ['Seated DB Press', 'Machine Shoulder Press'] },
    { name: 'Lateral Raise', movement: 'shoulder', intent: 'Side delt accessory', notes: 'Raise to shoulder height', substitutions: ['Cable Lateral Raise', 'Machine Lateral Raise'] },
    { name: 'Tricep Pushdown', movement: 'triceps', intent: 'Triceps accessory', notes: 'Keep elbows pinned', substitutions: ['Overhead Cable Extension', 'Dips (assisted)'] }
  ],
  pull: [
    { name: 'Seated Cable Row', movement: 'pull', intent: 'Mid-back strength', notes: 'Squeeze shoulder blades', substitutions: ['Chest-Supported Row', 'One-Arm DB Row'] },
    { name: 'Lat Pulldown', movement: 'pull', intent: 'Lat strength', notes: 'Control the tempo', substitutions: ['Assisted Pull-Up', 'Band Lat Pulldown'] },
    { name: 'Face Pull', movement: 'rear_delt', intent: 'Rear delt and upper back health', notes: 'Pull to face with elbows high', substitutions: ['Reverse Fly', 'Band Pull-Apart'] },
    { name: 'Hammer Curl', movement: 'curl', intent: 'Biceps and forearms', notes: 'Neutral grip', substitutions: ['Cable Curl', 'Dumbbell Curl'] },
    { name: 'Back Extension', movement: 'hinge', intent: 'Lower back endurance', notes: 'Move slowly and controlled', substitutions: ['Hip Hinge with DBs', 'Good Morning (light)'] }
  ],
  legs: [
    { name: 'Back Squat', movement: 'squat', intent: 'Primary lower-body strength', notes: 'Brace and keep chest up', substitutions: ['Front Squat', 'Leg Press'] },
    { name: 'Romanian Deadlift', movement: 'hinge', intent: 'Posterior chain strength', notes: 'Hinge from hips', substitutions: ['Hip Thrust', 'Back Extension'] },
    { name: 'Leg Press', movement: 'squat', intent: 'Quad focus with stability', notes: 'Control range', substitutions: ['Goblet Squat', 'Split Squat'] },
    { name: 'Leg Curl', movement: 'hamstring', intent: 'Hamstring isolation', notes: 'Pause at contraction', substitutions: ['Stability Ball Curl', 'Nordic Curl (assisted)'] },
    { name: 'Calf Raise', movement: 'calf', intent: 'Calf strength', notes: 'Full range of motion', substitutions: ['Seated Calf Raise', 'Single-Leg Calf Raise'] }
  ]
};

const HOME_TEMPLATES: Record<DayType, ExerciseTemplate[]> = {
  full_body: [
    { name: 'Bodyweight Squat', movement: 'squat', intent: 'Build leg strength with control', notes: 'Slow tempo, full range', substitutions: ['Chair Squat', 'Split Squat'] },
    { name: 'Push-Up', movement: 'push', intent: 'Upper-body pressing strength', notes: 'Keep core tight', substitutions: ['Incline Push-Up', 'Knee Push-Up'] },
    { name: 'Band Row', movement: 'pull', intent: 'Back strength with minimal equipment', notes: 'Pull elbows to ribs', substitutions: ['Doorway Row', 'Towel Row'] },
    { name: 'Hip Hinge (DB/KB)', movement: 'hinge', intent: 'Posterior chain strength', notes: 'Neutral spine', substitutions: ['Glute Bridge', 'Good Morning (band)'] },
    { name: 'Dead Bug', movement: 'core', intent: 'Core stability', notes: 'Move slowly', substitutions: ['Plank', 'Bird Dog'] }
  ],
  upper: [
    { name: 'Push-Up', movement: 'push', intent: 'Upper-body press', notes: 'Hands slightly wider than shoulders', substitutions: ['Incline Push-Up', 'Knee Push-Up'] },
    { name: 'Band Row', movement: 'pull', intent: 'Mid-back strength', notes: 'Squeeze shoulder blades', substitutions: ['Towel Row', 'Doorway Row'] },
    { name: 'Pike Push-Up', movement: 'push', intent: 'Shoulder focus', notes: 'Hips high, short range', substitutions: ['Dumbbell Press', 'Band Press'] },
    { name: 'Band Lat Pulldown', movement: 'pull', intent: 'Lat engagement', notes: 'Control the eccentric', substitutions: ['Straight-Arm Pulldown', 'Band Row'] },
    { name: 'Bicep Curl (Band)', movement: 'curl', intent: 'Arm accessory', notes: 'Slow tempo', substitutions: ['Isometric Curl Hold', 'Hammer Curl (DB)'] }
  ],
  lower: [
    { name: 'Split Squat', movement: 'lunge', intent: 'Unilateral leg strength', notes: 'Front knee over mid-foot', substitutions: ['Reverse Lunge', 'Step-Up'] },
    { name: 'Glute Bridge', movement: 'hinge', intent: 'Posterior chain', notes: 'Squeeze at top', substitutions: ['Hip Thrust', 'Single-Leg Glute Bridge'] },
    { name: 'Step-Up', movement: 'lunge', intent: 'Leg strength and balance', notes: 'Drive through heel', substitutions: ['Split Squat', 'Box Squat'] },
    { name: 'Hamstring Slide', movement: 'hamstring', intent: 'Hamstring strength', notes: 'Keep hips extended', substitutions: ['Nordic Curl (assisted)', 'Bridge Hold'] },
    { name: 'Calf Raise', movement: 'calf', intent: 'Calf strength', notes: 'Pause at top', substitutions: ['Single-Leg Calf Raise', 'Seated Calf Raise'] }
  ],
  push: [
    { name: 'Push-Up', movement: 'push', intent: 'Primary press', notes: 'Neutral spine', substitutions: ['Incline Push-Up', 'Knee Push-Up'] },
    { name: 'Pike Push-Up', movement: 'push', intent: 'Shoulder emphasis', notes: 'Short range, control', substitutions: ['Dumbbell Press', 'Band Press'] },
    { name: 'Diamond Push-Up', movement: 'triceps', intent: 'Triceps accessory', notes: 'Keep elbows tucked', substitutions: ['Close-Grip Push-Up', 'Bench Dips'] },
    { name: 'Band Fly', movement: 'chest', intent: 'Chest isolation', notes: 'Soft elbows', substitutions: ['Floor Fly (DB)', 'Push-Up Hold'] },
    { name: 'Band Tricep Extension', movement: 'triceps', intent: 'Triceps isolation', notes: 'Elbows fixed', substitutions: ['Overhead Band Extension', 'Bench Dips'] }
  ],
  pull: [
    { name: 'Band Row', movement: 'pull', intent: 'Back strength', notes: 'Squeeze shoulder blades', substitutions: ['Towel Row', 'Doorway Row'] },
    { name: 'Band Lat Pulldown', movement: 'pull', intent: 'Lat focus', notes: 'Control tempo', substitutions: ['Straight-Arm Pulldown', 'Band Row'] },
    { name: 'Band Face Pull', movement: 'rear_delt', intent: 'Rear delt and posture', notes: 'Elbows high', substitutions: ['Band Pull-Apart', 'Reverse Fly'] },
    { name: 'Bicep Curl (Band)', movement: 'curl', intent: 'Arm accessory', notes: 'Slow reps', substitutions: ['Isometric Hold', 'Hammer Curl (DB)'] },
    { name: 'Bird Dog', movement: 'core', intent: 'Core stability', notes: 'Keep hips level', substitutions: ['Dead Bug', 'Plank'] }
  ],
  legs: [
    { name: 'Bodyweight Squat', movement: 'squat', intent: 'Lower-body strength', notes: 'Full range', substitutions: ['Chair Squat', 'Split Squat'] },
    { name: 'Split Squat', movement: 'lunge', intent: 'Unilateral strength', notes: 'Control depth', substitutions: ['Reverse Lunge', 'Step-Up'] },
    { name: 'Glute Bridge', movement: 'hinge', intent: 'Posterior chain', notes: 'Squeeze glutes', substitutions: ['Hip Thrust', 'Single-Leg Bridge'] },
    { name: 'Hamstring Slide', movement: 'hamstring', intent: 'Hamstring strength', notes: 'Slow eccentric', substitutions: ['Nordic Curl (assisted)', 'Bridge Hold'] },
    { name: 'Calf Raise', movement: 'calf', intent: 'Calf strength', notes: 'Pause at top', substitutions: ['Single-Leg Calf Raise', 'Seated Calf Raise'] }
  ]
};

const FALLBACK_WARMUP = {
  description: '5–8 minutes of light cardio and dynamic mobility.',
  exercises: ['Brisk walk or bike', 'Leg swings', 'Arm circles', 'Hip openers']
};

const FALLBACK_COOLDOWN = {
  description: '5 minutes of easy movement and stretching.',
  exercises: ['Slow walk', 'Hamstring stretch', 'Chest stretch', 'Child’s pose']
};

function getRestrictedKeywords(questionnaire: QuestionnaireData): string[] {
  const injuries = questionnaire.injuries;
  const restricted: string[] = [];

  const addFromMap = (areaText: string) => {
    const areaLower = areaText.toLowerCase();
    for (const [area, movements] of Object.entries(INJURY_MOVEMENT_MAP)) {
      if (areaLower.includes(area)) {
        restricted.push(...movements);
      }
    }
  };

  for (const injury of injuries.currentInjuries) {
    if (injury.area) addFromMap(injury.area);
  }
  for (const injury of injuries.pastInjuries) {
    if (injury.area) addFromMap(injury.area);
  }

  restricted.push(...injuries.movementRestrictions);
  restricted.push(...injuries.painAreas);

  return Array.from(new Set(restricted.map((r) => r.toLowerCase()).filter(Boolean)));
}

function isRestricted(name: string, restrictedKeywords: string[]): boolean {
  const lower = name.toLowerCase();
  return restrictedKeywords.some((keyword) => lower.includes(keyword));
}

function getRepRange(goal: QuestionnaireData['goals']['primaryGoal'], isMain: boolean): string {
  switch (goal) {
    case 'strength':
      return isMain ? '4-6' : '6-8';
    case 'endurance':
      return '12-15';
    case 'fat_loss':
      return '10-15';
    case 'muscle_building':
      return isMain ? '6-10' : '8-12';
    case 'sport_specific':
      return '6-12';
    case 'general_fitness':
    default:
      return '8-12';
  }
}

function getRest(goal: QuestionnaireData['goals']['primaryGoal']): string {
  if (goal === 'strength') return '2-3 minutes';
  if (goal === 'endurance') return '60-90 seconds';
  return '90 seconds';
}

function getSets(level: QuestionnaireData['experience']['currentLevel'], isMain: boolean): number {
  if (level === 'beginner') return isMain ? 2 : 2;
  if (level === 'advanced') return isMain ? 4 : 3;
  return isMain ? 3 : 3;
}

function buildExercise(
  template: ExerciseTemplate,
  questionnaire: QuestionnaireData,
  isMain: boolean
): Exercise {
  return {
    name: template.name,
    sets: getSets(questionnaire.experience.currentLevel, isMain),
    reps: getRepRange(questionnaire.goals.primaryGoal, isMain),
    rest: getRest(questionnaire.goals.primaryGoal),
    intent: template.intent,
    notes: template.notes,
    substitutions: template.substitutions
  };
}

function getDayTemplates(dayType: DayType, gymAccess: boolean): ExerciseTemplate[] {
  return gymAccess ? GYM_TEMPLATES[dayType] : HOME_TEMPLATES[dayType];
}

function dayTypeName(dayType: DayType): string {
  switch (dayType) {
    case 'upper': return 'Upper Body';
    case 'lower': return 'Lower Body';
    case 'push': return 'Push Day';
    case 'pull': return 'Pull Day';
    case 'legs': return 'Leg Day';
    case 'full_body':
    default: return 'Full Body';
  }
}

function dayTypeFocus(dayType: DayType): string {
  switch (dayType) {
    case 'upper': return 'Chest, back, shoulders, arms';
    case 'lower': return 'Quads, glutes, hamstrings, calves';
    case 'push': return 'Chest, shoulders, triceps';
    case 'pull': return 'Back, biceps, rear delts';
    case 'legs': return 'Lower body emphasis';
    case 'full_body':
    default: return 'Full body';
  }
}

function buildSchedule(daysPerWeek: number): { structure: string; pattern: DayType[] } {
  if (daysPerWeek <= 2) {
    return { structure: 'Full Body (2 days)', pattern: ['full_body', 'full_body'].slice(0, daysPerWeek) };
  }
  if (daysPerWeek === 3) {
    return { structure: 'Full Body (3 days)', pattern: ['full_body', 'full_body', 'full_body'] };
  }
  if (daysPerWeek === 4) {
    return { structure: 'Upper/Lower split (4 days)', pattern: ['upper', 'lower', 'upper', 'lower'] };
  }
  return { structure: 'Push/Pull/Legs + Upper/Lower (5 days)', pattern: ['push', 'pull', 'legs', 'upper', 'lower'] };
}

export function generateFallbackPlan(
  questionnaire: QuestionnaireData,
  reason?: string
): GeneratedPlan {
  const restricted = getRestrictedKeywords(questionnaire);
  const daysPerWeek = Math.max(1, Math.min(5, questionnaire.availability.daysPerWeek));
  const maxExercises = questionnaire.constraints.maxExercisesPerSession ?? 5;
  const schedule = buildSchedule(daysPerWeek);
  const gymAccess = questionnaire.equipment.gymAccess;
  const sessionDuration = questionnaire.availability.sessionDuration;

  const days: WorkoutDay[] = schedule.pattern.map((dayType, index) => {
    const templates = getDayTemplates(dayType, gymAccess)
      .filter((t) => !isRestricted(t.name, restricted));

    const safeTemplates = templates.length > 0 ? templates : getDayTemplates('full_body', gymAccess);
    const selected = safeTemplates.slice(0, Math.max(3, Math.min(5, maxExercises)));
    const exercises = selected.map((t, i) => buildExercise(t, questionnaire, i < 2));

    return {
      dayNumber: index + 1,
      name: dayTypeName(dayType) + (dayType === 'full_body' ? ` ${String.fromCharCode(65 + index)}` : ''),
      focus: dayTypeFocus(dayType),
      duration: `${sessionDuration} min`,
      warmup: FALLBACK_WARMUP,
      exercises,
      cooldown: FALLBACK_COOLDOWN
    };
  });

  const overview = reason
    ? `Plan generated with a fast fallback template because the AI service was unavailable. You can still follow this plan safely while we restore AI generation.`
    : `A concise, balanced training plan tailored to your goals, schedule, and equipment.`;

  return {
    planName: 'Personalised Training Plan',
    overview,
    weeklyStructure: schedule.structure,
    days,
    progressionGuidance: 'When all sets feel comfortable, add 1–2 reps per set or a small amount of weight next session.',
    nutritionNotes: 'Aim for consistent protein intake and balanced meals that support your goal.',
    recoveryNotes: 'Prioritise sleep, hydration, and at least one full rest day per week.',
    disclaimer: 'Consult a healthcare professional before starting any exercise program.'
  };
}
