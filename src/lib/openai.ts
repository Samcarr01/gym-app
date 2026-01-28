import OpenAI from 'openai';
import { QuestionnaireData, GeneratedPlan, GeneratedPlanSchema } from '@/lib/types';
import { buildPrompt } from '@/lib/prompts';
import { generateFallbackPlan } from '@/lib/fallback-plan';

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    maxRetries: 0
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

async function createPlanWithAI({
  openai,
  system,
  user,
  model,
  maxTokens,
  temperature,
  timeoutMs
}: {
  openai: OpenAI;
  system: string;
  user: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeoutMs: number;
}): Promise<GeneratedPlan> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      response_format: { type: 'json_object' },
      temperature,
      max_tokens: maxTokens,
      signal: controller.signal
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error('No content in response');
    }

    const parsed = parseJsonFromContent(content);
    return GeneratedPlanSchema.parse(parsed);
  } finally {
    clearTimeout(timeout);
  }
}

export async function generatePlan(
  questionnaire: QuestionnaireData,
  existingPlan?: string
): Promise<GeneratedPlan> {
  const openai = getOpenAIClient();
  const { system, user } = buildPrompt(questionnaire, existingPlan);
  const primaryModel = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';

  if (!openai) {
    return generateFallbackPlan(questionnaire, 'Missing OPENAI_API_KEY');
  }

  try {
    return await createPlanWithAI({
      openai,
      system,
      user,
      model: primaryModel,
      maxTokens: 1200,
      temperature: 0.5,
      timeoutMs: 20000
    });
  } catch (error) {
    console.error('AI generation failed, retrying with smaller settings:', error);

    const fallbackModel = primaryModel === 'gpt-4o-mini' ? 'gpt-4o-mini' : 'gpt-4o-mini';

    try {
      return await createPlanWithAI({
        openai,
        system,
        user,
        model: fallbackModel,
        maxTokens: 800,
        temperature: 0.4,
        timeoutMs: 15000
      });
    } catch (retryError) {
      console.error('AI generation failed after retry, using fallback plan:', retryError);
      return generateFallbackPlan(questionnaire, 'AI service timeout/unavailable');
    }
  }
}
