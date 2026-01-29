import { QuestionnaireData, GeneratedPlan } from '@/lib/types';

// Quality report types (matching server)
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

interface ApiResponse {
  success: boolean;
  plan?: GeneratedPlan;
  qualityReport?: QualityReport;
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

export interface GeneratePlanResult {
  plan: GeneratedPlan;
  qualityReport: QualityReport;
}

export async function generatePlanAPI(
  questionnaire: QuestionnaireData,
  existingPlan?: string
): Promise<GeneratePlanResult> {
  const response = await fetch('/api/generate-plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ questionnaire, existingPlan })
  });

  const data: ApiResponse = await response.json();

  if (!data.success || !data.plan || !data.qualityReport) {
    throw new Error(data.error?.message || 'Failed to generate plan');
  }

  return { plan: data.plan, qualityReport: data.qualityReport };
}

export async function generatePlanStream(
  questionnaire: QuestionnaireData,
  existingPlan: string | undefined,
  onProgress?: (progress: GeneratePlanProgress) => void
): Promise<GeneratePlanResult> {
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
        return {
          plan: data.plan as GeneratedPlan,
          qualityReport: data.qualityReport as QualityReport
        };
      }
    }
  }

  throw new Error('Plan generation ended unexpectedly');
}
