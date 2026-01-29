import OpenAI from 'openai';
import { QuestionnaireData, GeneratedPlan, GeneratedPlanSchema } from '@/lib/types';
import { buildPrompt } from '@/lib/prompts';
import { normalizePlan, recommendSplit } from '@/lib/plan-normalizer';
import { buildProgramDesign } from '@/lib/program-design';

// Quality validation types
export interface ValidationAttempt {
  valid: boolean;
  issues: string[];
}

export interface QualityReport {
  firstAttempt: ValidationAttempt;
  retryAttempts: ValidationAttempt[];
  finalStatus: 'passed' | 'passed_with_issues' | 'failed_but_returned';
  totalAttempts: number;
}

export interface GeneratedPlanWithReport {
  plan: GeneratedPlan;
  qualityReport: QualityReport;
}

const PLAN_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'planName',
    'overview',
    'weeklyStructure',
    'days',
    'progressionGuidance',
    'nutritionNotes',
    'recoveryNotes',
    'disclaimer'
  ],
  properties: {
    planName: { type: 'string' },
    overview: { type: 'string' },
    weeklyStructure: { type: 'string' },
    days: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'dayNumber',
          'name',
          'focus',
          'duration',
          'warmup',
          'exercises',
          'cooldown'
        ],
        properties: {
          dayNumber: { type: 'number' },
          name: { type: 'string' },
          focus: { type: 'string' },
          duration: { type: 'string' },
          warmup: {
            type: 'object',
            additionalProperties: false,
            required: ['description', 'exercises'],
            properties: {
              description: { type: 'string' },
              exercises: { type: 'array', items: { type: 'string' } }
            }
          },
          exercises: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['name', 'sets', 'reps', 'rest', 'intent', 'rationale', 'notes', 'substitutions', 'progressionNote'],
              properties: {
                name: { type: 'string' },
                sets: { type: 'number' },
                reps: { type: 'string' },
                rest: { type: 'string' },
                intent: { type: 'string' },
                rationale: { type: 'string' },
                notes: { type: 'string' },
                substitutions: { type: 'array', items: { type: 'string' } },
                progressionNote: { type: 'string' }
              }
            }
          },
          cooldown: {
            type: 'object',
            additionalProperties: false,
            required: ['description', 'exercises'],
            properties: {
              description: { type: 'string' },
              exercises: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      }
    },
    progressionGuidance: { type: 'string' },
    nutritionNotes: { type: 'string' },
    recoveryNotes: { type: 'string' },
    disclaimer: { type: 'string' }
  }
};

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing');
  }
  return new OpenAI({
    apiKey,
    maxRetries: 2
  });
}

export async function generatePlan(
  questionnaire: QuestionnaireData,
  existingPlan?: string
): Promise<GeneratedPlanWithReport> {
  const openai = getOpenAIClient();
  const { system, user } = buildPrompt(questionnaire, existingPlan);
  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';

  const MAX_RETRIES = 3;
  const qualityReport: QualityReport = {
    firstAttempt: { valid: false, issues: [] },
    retryAttempts: [],
    finalStatus: 'failed_but_returned',
    totalAttempts: 0
  };

  const response = await openai.responses.create({
    model,
    input: user,
    instructions: system,
    text: {
      format: {
        type: 'json_schema',
        name: 'workout_plan',
        strict: true,
        schema: PLAN_JSON_SCHEMA
      }
    },
    temperature: 0.3,
    max_output_tokens: 6000
  });

  let raw = (response as any).output_text || '';
  let plan: GeneratedPlan;

  try {
    const parsed = parseJsonFromContent(raw);
    plan = GeneratedPlanSchema.parse(parsed);
  } catch (error) {
    // Attempt JSON repair
    const repairResponse = await openai.responses.create({
      model,
      input: `Fix the JSON below to be valid and match the required schema exactly. Output only valid JSON.\n\n${raw}`,
      instructions:
        'You are a JSON repair tool. Return ONLY a valid JSON object that matches the schema.',
      text: {
        format: {
          type: 'json_schema',
          name: 'workout_plan',
          strict: true,
          schema: PLAN_JSON_SCHEMA
        }
      },
      temperature: 0,
      max_output_tokens: 2000
    });

    const repairedRaw = (repairResponse as any).output_text || '';
    const repairedParsed = parseJsonFromContent(repairedRaw);
    plan = GeneratedPlanSchema.parse(repairedParsed);
  }

  let normalized = normalizePlan(plan, questionnaire);
  qualityReport.totalAttempts = 1;

  // Validate first attempt
  const firstValidation = validatePlanQuality(normalized, questionnaire);
  qualityReport.firstAttempt = firstValidation;

  if (firstValidation.valid) {
    qualityReport.finalStatus = 'passed';
    const refined = await refinePlanIfNeeded(openai, model, system, user, normalized, questionnaire);
    const fixed = fixBannedPhrases(refined);
    return { plan: fixed, qualityReport };
  }

  // Retry loop with escalating feedback
  let currentPlan = normalized;
  let currentIssues = firstValidation.issues;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    qualityReport.totalAttempts++;

    const retryResult = await retryWithQualityFeedback(
      openai, model, system, user, currentPlan, currentIssues, questionnaire, attempt, MAX_RETRIES
    );

    const retryValidation = validatePlanQuality(retryResult, questionnaire);
    qualityReport.retryAttempts.push(retryValidation);

    if (retryValidation.valid) {
      qualityReport.finalStatus = 'passed';
      const refined = await refinePlanIfNeeded(openai, model, system, user, retryResult, questionnaire);
      const fixed = fixBannedPhrases(refined);
      return { plan: fixed, qualityReport };
    }

    // Check if issues improved
    if (retryValidation.issues.length < currentIssues.length) {
      currentPlan = retryResult;
      currentIssues = retryValidation.issues;
    }
  }

  // All retries failed - return best attempt with post-processing fixes
  qualityReport.finalStatus = currentIssues.length <= 3 ? 'passed_with_issues' : 'failed_but_returned';
  const refined = await refinePlanIfNeeded(openai, model, system, user, currentPlan, questionnaire);
  const fixed = fixBannedPhrases(refined);

  return { plan: fixed, qualityReport };
}

function parseJsonFromContent(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const snippet = trimmed.slice(start, end + 1);
      return JSON.parse(snippet);
    }
    throw new Error('Invalid JSON in AI response');
  }
}

const BANNED_PHRASES = [
  'Core lift selected to match your goals and targets',
  'Accessory work to round out the session',
  'Included to directly address your stated targets',
  'Use a controlled tempo and focus on form',
  'Selected to support your goals',
  'Chosen based on your preferences'
];

// Post-processing replacements for banned phrases
const PHRASE_REPLACEMENTS: Array<{ pattern: RegExp; replacement: string }> = [
  {
    pattern: /core lift selected to match your goals and targets/gi,
    replacement: 'Primary compound movement for strength foundation'
  },
  {
    pattern: /accessory work to round out the session/gi,
    replacement: 'Supporting movement for balanced muscle development'
  },
  {
    pattern: /included to directly address your stated targets/gi,
    replacement: 'Targets the muscle groups you want to develop'
  },
  {
    pattern: /use a controlled tempo and focus on form/gi,
    replacement: 'Control the eccentric (2-3s down), pause briefly at the stretch position'
  },
  {
    pattern: /selected to support your goals/gi,
    replacement: 'Chosen to build the movement pattern and muscle'
  },
  {
    pattern: /chosen based on your preferences/gi,
    replacement: 'Matches your training style and available equipment'
  },
  {
    pattern: /progress gradually/gi,
    replacement: '📈 Add 2.5kg when completing all sets at top of rep range with good form'
  },
  {
    pattern: /add weight when ready/gi,
    replacement: '📈 Progress by adding 1-2 reps per session, then increase weight and reset reps'
  },
  {
    pattern: /progress at your own pace/gi,
    replacement: '📈 Track your weights; aim to increase load or reps every 1-2 weeks'
  }
];

function fixBannedPhrases(plan: GeneratedPlan): GeneratedPlan {
  const fixText = (text: string): string => {
    let result = text;
    for (const { pattern, replacement } of PHRASE_REPLACEMENTS) {
      result = result.replace(pattern, replacement);
    }
    return result;
  };

  return {
    ...plan,
    days: plan.days.map(day => ({
      ...day,
      exercises: day.exercises.map(exercise => ({
        ...exercise,
        intent: fixText(exercise.intent),
        rationale: fixText(exercise.rationale),
        notes: fixText(exercise.notes),
        progressionNote: fixText(exercise.progressionNote)
      }))
    }))
  };
}

function validatePlanQuality(plan: GeneratedPlan, questionnaire: QuestionnaireData): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for banned phrases in exercise rationale/intent
  for (const day of plan.days) {
    for (const exercise of day.exercises) {
      const textToCheck = `${exercise.intent} ${exercise.rationale} ${exercise.notes}`.toLowerCase();
      for (const banned of BANNED_PHRASES) {
        if (textToCheck.includes(banned.toLowerCase())) {
          issues.push(`Exercise "${exercise.name}" contains banned phrase: "${banned}"`);
        }
      }

      // Check that rationale is different from intent
      if (exercise.rationale === exercise.intent) {
        issues.push(`Exercise "${exercise.name}" has identical rationale and intent (not personalized)`);
      }

      // Check that progressionNote exists and is substantial
      if (!exercise.progressionNote || exercise.progressionNote.length < 20) {
        issues.push(`Exercise "${exercise.name}" missing detailed progression guidance`);
      }

      // Check if exercise name contains multiple favorite exercises combined
      const favorites = questionnaire.preferences.favouriteExercises;
      if (favorites.length > 1) {
        const exerciseNameLower = exercise.name.toLowerCase();
        const matchingFavorites = favorites.filter(fav =>
          fav.trim() && exerciseNameLower.includes(fav.toLowerCase())
        );
        if (matchingFavorites.length > 1) {
          issues.push(`Exercise "${exercise.name}" incorrectly combines multiple favorites (${matchingFavorites.join(' and ')}). Create separate exercises!`);
        }
      }
    }
  }

  // Check for meal examples in nutrition notes
  const hasBreakfast = plan.nutritionNotes.toLowerCase().includes('breakfast');
  const hasLunch = plan.nutritionNotes.toLowerCase().includes('lunch');
  const hasSampleMeals = plan.nutritionNotes.includes('Sample') || plan.nutritionNotes.includes('sample');

  if (!hasBreakfast || !hasLunch || !hasSampleMeals) {
    issues.push('Nutrition notes missing required meal examples (must include breakfast, lunch, sample meals)');
  }

  return { valid: issues.length === 0, issues };
}

function getEscalatingFeedback(
  issues: string[],
  questionnaire: QuestionnaireData,
  attemptNumber: number,
  maxRetries: number
): string {
  const urgencyLevel = attemptNumber === 1 ? '⚠️' : attemptNumber === 2 ? '🚨' : '❌ FINAL WARNING';
  const urgencyText = attemptNumber === 1
    ? 'Please fix these issues'
    : attemptNumber === 2
    ? 'CRITICAL: These issues MUST be fixed'
    : `LAST ATTEMPT (${attemptNumber}/${maxRetries}): Fix ALL issues or plan will be returned with quality warnings`;

  return `
${urgencyLevel} QUALITY CHECK FAILED - ATTEMPT ${attemptNumber}/${maxRetries} ${urgencyLevel}

${urgencyText}:
${issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

REQUIRED FIXES:

1. EVERY exercise rationale MUST be UNIQUE and reference THIS USER'S specific situation:
   - Their weak points: ${questionnaire.experience.weakPoints.join(', ') || 'none mentioned'}
   - Their equipment: ${questionnaire.equipment.gymAccess ? 'gym access' : 'home/limited equipment'}
   - Their injuries: ${questionnaire.injuries.currentInjuries.length > 0 ? questionnaire.injuries.currentInjuries.map(i => i.area).join(', ') : 'none'}
   - Their favorites: ${questionnaire.preferences.favouriteExercises.join(', ') || 'none mentioned'}

2. BANNED PHRASES (using these = instant failure):
   ❌ "Core lift selected to match your goals and targets"
   ❌ "Accessory work to round out the session"
   ❌ "Included to directly address your stated targets"
   ❌ "Use a controlled tempo and focus on form"
   ❌ "Selected to support your goals"
   ❌ "Chosen based on your preferences"

3. nutritionNotes MUST include ACTUAL meal examples with times and protein:
   ✓ "Sample Training Day: Breakfast (7am): 4 eggs, toast - 32g protein..."

4. EVERY progressionNote MUST be 30+ characters with specific guidance:
   ✓ "📈 Add 2.5kg when completing 3x10 with good form. Deload 10% after 4 weeks."
   ❌ "Progress gradually" (TOO SHORT)
   ❌ "Add weight when ready" (NOT SPECIFIC)

${attemptNumber >= 2 ? `
⚠️ STRONGER WARNING: Previous ${attemptNumber - 1} attempt(s) still had issues.
Focus on the SPECIFIC issues listed above. Each issue MUST be addressed.
` : ''}`;
}

async function retryWithQualityFeedback(
  openai: OpenAI,
  model: string,
  system: string,
  userProfile: string,
  failedPlan: GeneratedPlan,
  issues: string[],
  questionnaire: QuestionnaireData,
  attemptNumber: number,
  maxRetries: number
): Promise<GeneratedPlan> {
  const feedbackPrompt = `
${getEscalatingFeedback(issues, questionnaire, attemptNumber, maxRetries)}

Original user context:
${userProfile}

Previous plan that failed validation:
${JSON.stringify(failedPlan, null, 2).slice(0, 2000)}...

Generate a CORRECTED plan with all issues fixed.`;

  const response = await openai.responses.create({
    model,
    input: feedbackPrompt,
    instructions: system,
    text: {
      format: {
        type: 'json_schema',
        name: 'workout_plan',
        strict: true,
        schema: PLAN_JSON_SCHEMA
      }
    },
    temperature: 0.3 + (attemptNumber * 0.1), // Slightly increase temperature on retries
    max_output_tokens: 6000
  });

  const raw = (response as any).output_text || '';
  const parsed = parseJsonFromContent(raw);
  const retried = GeneratedPlanSchema.parse(parsed);
  return normalizePlan(retried, questionnaire);
}

async function refinePlanIfNeeded(
  openai: OpenAI,
  model: string,
  system: string,
  userProfile: string,
  plan: GeneratedPlan,
  questionnaire: QuestionnaireData
): Promise<GeneratedPlan> {
  const requirements = {
    goals: {
      primary: questionnaire.goals.primaryGoal,
      secondary: questionnaire.goals.secondaryGoal,
      timeframe: questionnaire.goals.timeframe,
      specificTargets: questionnaire.goals.specificTargets
    },
    availability: {
      daysPerWeek: questionnaire.availability.daysPerWeek,
      sessionDuration: questionnaire.availability.sessionDuration
    },
    preferences: {
      favouriteExercises: questionnaire.preferences.favouriteExercises,
      dislikedExercises: questionnaire.preferences.dislikedExercises,
      preferredSplit: questionnaire.preferences.preferredSplit
    },
    recovery: questionnaire.recovery,
    nutrition: questionnaire.nutrition,
    constraints: {
      maxExercisesPerSession: questionnaire.constraints.maxExercisesPerSession
    },
    recommendedSplit: recommendSplit(questionnaire),
    programDesign: buildProgramDesign(questionnaire)
  };

  const reviewPrompt = `
You are reviewing an AI-generated workout plan for alignment with the user's questionnaire.
Your job is to fix any mismatches and improve quality, while keeping the same JSON schema.

Rules:
- Must reflect primary/secondary goals and timeframe
- Must incorporate specific targets
- Must reflect recovery (sleep, stress, recovery capacity)
- Must reflect nutrition approach + protein intake + restrictions
- Include favourite exercises when safe and available
- Exclude disliked exercises
- Respect max exercises per session
- Respect equipment and injuries
- Ensure every day has exactly maxExercisesPerSession exercises if a max is provided
- If sport-specific or a sport is mentioned, include power/strength, conditioning/engine, and mixed days
- Avoid repeating the exact same main lift across multiple days (use variations)
- Nutrition notes must include calorie guidance and meal timing/snack guidance
- Overview must mention at least 2 specific user details (schedule, equipment, cardio preference, weak points, favourites)

Must-match requirements (use these exact values where relevant):
${JSON.stringify(requirements)}

User questionnaire data:
${userProfile}

Current plan JSON:
${JSON.stringify(plan)}

Return ONLY a valid JSON object that matches the schema exactly.`;

  try {
    const response = await openai.responses.create({
      model,
      input: reviewPrompt,
      instructions: system,
      text: {
        format: {
          type: 'json_schema',
          name: 'workout_plan',
          strict: true,
          schema: PLAN_JSON_SCHEMA
        }
      },
      temperature: 0.3,
      max_output_tokens: 6000
    });

    const raw = (response as any).output_text || '';
    const parsed = parseJsonFromContent(raw);
    const refined = GeneratedPlanSchema.parse(parsed);
    return normalizePlan(refined, questionnaire);
  } catch (error) {
    console.error('Plan refinement failed, returning normalized plan:', error);
    return plan;
  }
}
