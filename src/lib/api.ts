import { QuestionnaireData, GeneratedPlan } from '@/lib/types';

interface ApiResponse {
  success: boolean;
  plan?: GeneratedPlan;
  error?: {
    code: string;
    message: string;
  };
}

export interface GeneratePlanProgress {
  progress: number;
  stage: string;
  message: string;
}

export async function generatePlanAPI(
  questionnaire: QuestionnaireData,
  existingPlan?: string
): Promise<GeneratedPlan> {
  const response = await fetch('/api/generate-plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ questionnaire, existingPlan })
  });

  const data: ApiResponse = await response.json();

  if (!data.success || !data.plan) {
    throw new Error(data.error?.message || 'Failed to generate plan');
  }

  return data.plan;
}

export async function generatePlanStream(
  questionnaire: QuestionnaireData,
  existingPlan: string | undefined,
  onProgress?: (progress: GeneratePlanProgress) => void
): Promise<GeneratedPlan> {
  const response = await fetch('/api/generate-plan/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ questionnaire, existingPlan })
  });

  if (!response.ok || !response.body) {
    throw new Error('Failed to start plan generation');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';

    for (const part of parts) {
      if (!part.trim()) continue;
      let event = 'message';
      const dataLines: string[] = [];
      for (const line of part.split('\n')) {
        if (line.startsWith('event:')) {
          event = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trim());
        }
      }
      if (dataLines.length === 0) continue;
      const dataStr = dataLines.join('\n');
      let data: any;
      try {
        data = JSON.parse(dataStr);
      } catch {
        continue;
      }

      if (event === 'progress') {
        onProgress?.(data as GeneratePlanProgress);
      } else if (event === 'error') {
        throw new Error(data.message || 'Failed to generate plan');
      } else if (event === 'result') {
        return data.plan as GeneratedPlan;
      }
    }
  }

  throw new Error('Plan generation ended unexpectedly');
}
