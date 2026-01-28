import { QuestionnaireData, GeneratedPlan } from '@/lib/types';

interface ApiResponse {
  success: boolean;
  plan?: GeneratedPlan;
  error?: {
    code: string;
    message: string;
  };
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
