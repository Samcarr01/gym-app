import OpenAI from 'openai';
import { QuestionnaireData, GeneratedPlan, GeneratedPlanSchema } from '@/lib/types';
import { buildPrompt } from '@/lib/prompts';

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
    response_format: { type: 'json_object' },
    temperature: 0.5,
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
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 2000
  });

  const retryContent = retry.choices[0].message.content;
  if (!retryContent) {
    throw new Error('No content in response (retry)');
  }

  const retryParsed = parseJsonFromContent(retryContent);
  return GeneratedPlanSchema.parse(retryParsed);
}
