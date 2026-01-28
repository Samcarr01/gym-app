import OpenAI from 'openai';
import { QuestionnaireData, GeneratedPlan, GeneratedPlanSchema } from '@/lib/types';
import { buildPrompt } from '@/lib/prompts';
import { normalizePlan, recommendSplit } from '@/lib/plan-normalizer';
import { buildProgramDesign } from '@/lib/program-design';

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
): Promise<GeneratedPlan> {
  const openai = getOpenAIClient();
  const { system, user } = buildPrompt(questionnaire, existingPlan);
  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';

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
    temperature: 0.2,
    max_output_tokens: 2000
  });

  const raw = (response as any).output_text || '';

  try {
    const parsed = parseJsonFromContent(raw);
    const plan = GeneratedPlanSchema.parse(parsed);
    const normalized = normalizePlan(plan, questionnaire);
    return await refinePlanIfNeeded(openai, model, system, user, normalized, questionnaire);
  } catch (error) {
    console.error('AI response parse failed, retrying with repair:', error);
  }

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
  const repairedPlan = GeneratedPlanSchema.parse(repairedParsed);
  const normalizedRepaired = normalizePlan(repairedPlan, questionnaire);
  return await refinePlanIfNeeded(openai, model, system, user, normalizedRepaired, questionnaire);
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
      temperature: 0.2,
      max_output_tokens: 2000
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
