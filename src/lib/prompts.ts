import { QuestionnaireData, InjuryRecord } from '@/lib/types';

const SYSTEM_INSTRUCTIONS = `You are an expert strength and conditioning coach with 20+ years of experience.
You create personalised training programmes that are:

1. SAFE – Never prescribe exercises that conflict with stated injuries
2. EFFECTIVE – Based on proven training principles
3. ADHERENT – Designed around the user's actual schedule and equipment
4. PROGRESSIVE – Include clear progression guidance

Your tone is calm, professional, and encouraging. You explain the "why" behind each recommendation without being preachy.

CRITICAL RULES:
- If an injury is marked HIGH severity, completely avoid that movement pattern
- If equipment is limited, substitute with available alternatives
- Always include warm-up and cool-down guidance
- Default to conservative volume for beginners
- Include rest day recommendations

OUTPUT FORMAT:
You must respond with a valid JSON object matching this exact structure:
{
  "planName": "string - descriptive name for this plan",
  "overview": "string - 2-3 sentence summary",
  "weeklyStructure": "string - e.g., 'Push/Pull/Legs with 2 rest days'",
  "days": [
    {
      "dayNumber": number,
      "name": "string - e.g., 'Push Day'",
      "focus": "string - muscle groups targeted",
      "duration": "string - estimated time",
      "warmup": {
        "description": "string",
        "exercises": ["string array"]
      },
      "exercises": [
        {
          "name": "string",
          "sets": number,
          "reps": "string - e.g., '8-12' or '5x5'",
          "rest": "string - e.g., '90 seconds'",
          "intent": "string - why this exercise",
          "notes": "string - form cues or variations",
          "substitutions": ["string array - alternative exercises"]
        }
      ],
      "cooldown": {
        "description": "string",
        "exercises": ["string array"]
      }
    }
  ],
  "progressionGuidance": "string - how to progress over time",
  "nutritionNotes": "string - brief dietary suggestions",
  "recoveryNotes": "string - rest and recovery advice",
  "disclaimer": "Consult a healthcare professional before starting any exercise program."
}`;

const UPDATE_MODE_PROMPT = `The user has an existing plan they want to update. Here is their current plan:

---
{existingPlanText}
---

Based on their updated questionnaire responses, modify this plan to:
1. Address any new injuries or restrictions
2. Adjust volume/intensity based on their current recovery capacity
3. Incorporate their preferred exercises where appropriate
4. Maintain exercises they're progressing well on
5. Remove or substitute exercises that conflict with new constraints

Preserve the general structure if it was working well, but don't hesitate to make significant changes if their situation has changed substantially.

`;

// Injury to movement mapping for safety
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

function getRestrictedMovements(injuries: InjuryRecord[]): string[] {
  const restricted: string[] = [];

  for (const injury of injuries) {
    if (injury.severity === 'high') {
      const areaLower = injury.area.toLowerCase();
      for (const [area, movements] of Object.entries(INJURY_MOVEMENT_MAP)) {
        if (areaLower.includes(area)) {
          restricted.push(...movements);
        }
      }
    }
  }

  return Array.from(new Set(restricted));
}

function formatInjuries(injuries: { currentInjuries: InjuryRecord[]; movementRestrictions: string[] }): string {
  if (injuries.currentInjuries.length === 0 && injuries.movementRestrictions.length === 0) {
    return 'No current injuries or restrictions reported.';
  }

  let output = '';

  if (injuries.currentInjuries.length > 0) {
    output += 'Current injuries:\n';
    for (const injury of injuries.currentInjuries) {
      output += `- ${injury.area} (${injury.severity} severity)`;
      if (injury.notes) output += ` - ${injury.notes}`;
      output += '\n';
    }
  }

  const restricted = getRestrictedMovements(injuries.currentInjuries);
  if (restricted.length > 0) {
    output += `\nMOVEMENTS TO COMPLETELY AVOID (high-severity injuries):\n${restricted.join(', ')}\n`;
    output += '\nThese exercises or similar movement patterns must NOT appear in the plan.\n';
  }

  if (injuries.movementRestrictions.length > 0) {
    output += `\nAdditional movement restrictions: ${injuries.movementRestrictions.join(', ')}\n`;
  }

  return output;
}

export function buildPrompt(
  questionnaire: QuestionnaireData,
  existingPlan?: string
): { system: string; user: string } {
  let user = '';

  if (existingPlan) {
    user = UPDATE_MODE_PROMPT.replace('{existingPlanText}', existingPlan);
  }

  user += `
## User Profile

### Goals
- Primary: ${questionnaire.goals.primaryGoal.replace('_', ' ')}
- Secondary: ${questionnaire.goals.secondaryGoal?.replace('_', ' ') || 'None'}
- Timeframe: ${questionnaire.goals.timeframe}
- Specific targets: ${questionnaire.goals.specificTargets.join(', ') || 'None specified'}

### Experience
- Training years: ${questionnaire.experience.trainingYears}
- Level: ${questionnaire.experience.currentLevel}
- Recent training: ${questionnaire.experience.recentTraining || 'Not specified'}
- Strong points: ${questionnaire.experience.strongPoints.join(', ') || 'Not specified'}
- Weak points: ${questionnaire.experience.weakPoints.join(', ') || 'Not specified'}

### Availability
- Days per week: ${questionnaire.availability.daysPerWeek}
- Session duration: ${questionnaire.availability.sessionDuration} minutes
- Preferred days: ${questionnaire.availability.preferredDays.join(', ') || 'Flexible'}
- Time of day: ${questionnaire.availability.timeOfDay}

### Equipment
- Gym access: ${questionnaire.equipment.gymAccess ? 'Yes' : 'No'}
- Gym type: ${questionnaire.equipment.gymType || 'N/A'}
- Available equipment: ${questionnaire.equipment.availableEquipment.join(', ') || 'Not specified'}
- Limited equipment: ${questionnaire.equipment.limitedEquipment.join(', ') || 'None'}

### Injuries (CRITICAL - MUST RESPECT)
${formatInjuries(questionnaire.injuries)}

### Recovery
- Sleep: ${questionnaire.recovery.sleepHours} hours (${questionnaire.recovery.sleepQuality} quality)
- Stress level: ${questionnaire.recovery.stressLevel.replace('_', ' ')}
- Recovery capacity: ${questionnaire.recovery.recoveryCapacity}

### Nutrition
- Approach: ${questionnaire.nutrition.nutritionApproach}
- Protein intake: ${questionnaire.nutrition.proteinIntake}
- Dietary restrictions: ${questionnaire.nutrition.dietaryRestrictions.join(', ') || 'None'}
- Supplements: ${questionnaire.nutrition.supplementUse.join(', ') || 'None'}

### Preferences
- Favourite exercises: ${questionnaire.preferences.favouriteExercises.join(', ') || 'None specified'}
- Exercises to avoid: ${questionnaire.preferences.dislikedExercises.join(', ') || 'None'}
- Preferred split: ${questionnaire.preferences.preferredSplit?.replace('_', ' ') || 'No preference'}
- Cardio preference: ${questionnaire.preferences.cardioPreference}

### Additional Constraints
- Max exercises per session: ${questionnaire.constraints.maxExercisesPerSession || 'No limit'}
- Time constraints: ${questionnaire.constraints.timeConstraints || 'None'}
- Other notes: ${questionnaire.constraints.otherNotes || 'None'}

Please generate a personalised workout plan based on this profile.`;

  return {
    system: SYSTEM_INSTRUCTIONS,
    user
  };
}
