import OpenAI from 'openai';
import { QuestionnaireData, GeneratedPlan, GeneratedPlanSchema } from '@/lib/types';
import { buildPrompt } from '@/lib/prompts';

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
              required: ['name', 'sets', 'reps', 'rest', 'intent', 'notes', 'substitutions'],
              properties: {
                name: { type: 'string' },
                sets: { type: 'number' },
                reps: { type: 'string' },
                rest: { type: 'string' },
                intent: { type: 'string' },
                notes: { type: 'string' },
                substitutions: { type: 'array', items: { type: 'string' } }
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
    return GeneratedPlanSchema.parse(parsed);
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
  return GeneratedPlanSchema.parse(repairedParsed);
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
