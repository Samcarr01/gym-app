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

function parseJsonFromContent(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const snippet = content.slice(start, end + 1);
      return JSON.parse(snippet);
    }
    throw new Error('Invalid JSON in AI response');
  }
}

export async function generatePlan(
  questionnaire: QuestionnaireData,
  existingPlan?: string
): Promise<GeneratedPlan> {
  const openai = getOpenAIClient();
  const { system, user } = buildPrompt(questionnaire, existingPlan);
  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'workout_plan',
        strict: true,
        schema: PLAN_JSON_SCHEMA
      }
    },
    temperature: 0.2,
    max_tokens: 2000
  });

  const content = response.choices[0].message.content;

  if (!content) {
    throw new Error('No content in response');
  }

  try {
    const parsed = parseJsonFromContent(content);
    return GeneratedPlanSchema.parse(parsed);
  } catch (error) {
    console.error('AI response parse failed, retrying once:', error);
  }

  const retry = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'workout_plan',
        strict: true,
        schema: PLAN_JSON_SCHEMA
      }
    },
    temperature: 0.2,
    max_tokens: 2000
  });

  const retryContent = retry.choices[0].message.content;
  if (!retryContent) {
    throw new Error('No content in response (retry)');
  }

  const retryParsed = parseJsonFromContent(retryContent);
  return GeneratedPlanSchema.parse(retryParsed);
}
