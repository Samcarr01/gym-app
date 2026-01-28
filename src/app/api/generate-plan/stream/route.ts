import { NextRequest } from 'next/server';
import { generatePlan } from '@/lib/openai';
import { GeneratePlanRequestSchema } from '@/lib/types';

// Allow more time for plan generation on Vercel
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

type ProgressPayload = {
  progress: number;
  stage: string;
  message: string;
};

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
}

function sanitizeInjuries(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      area: typeof (item as any).area === 'string' ? (item as any).area.trim() : '',
      severity: (item as any).severity ?? 'medium',
      notes: typeof (item as any).notes === 'string' ? (item as any).notes : ''
    }))
    .filter((item) => item.area.length > 0);
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: ProgressPayload | { plan: unknown } | { message: string }) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      const sendProgress = (progress: number, stage: string, message: string) => {
        send('progress', { progress, stage, message });
      };

      try {
        sendProgress(5, 'validate', 'Validating inputs');

        const body = await request.json();

        const sanitizedBody = {
          ...body,
          questionnaire: body?.questionnaire
            ? {
              ...body.questionnaire,
              goals: {
                ...body.questionnaire.goals,
                specificTargets: sanitizeStringArray(body.questionnaire.goals?.specificTargets)
              },
              experience: {
                ...body.questionnaire.experience,
                strongPoints: sanitizeStringArray(body.questionnaire.experience?.strongPoints),
                weakPoints: sanitizeStringArray(body.questionnaire.experience?.weakPoints)
              },
              equipment: {
                ...body.questionnaire.equipment,
                availableEquipment: sanitizeStringArray(body.questionnaire.equipment?.availableEquipment),
                limitedEquipment: sanitizeStringArray(body.questionnaire.equipment?.limitedEquipment)
              },
              injuries: {
                ...body.questionnaire.injuries,
                currentInjuries: sanitizeInjuries(body.questionnaire.injuries?.currentInjuries),
                pastInjuries: sanitizeInjuries(body.questionnaire.injuries?.pastInjuries),
                movementRestrictions: sanitizeStringArray(body.questionnaire.injuries?.movementRestrictions),
                painAreas: sanitizeStringArray(body.questionnaire.injuries?.painAreas)
              },
              nutrition: {
                ...body.questionnaire.nutrition,
                dietaryRestrictions: sanitizeStringArray(body.questionnaire.nutrition?.dietaryRestrictions),
                supplementUse: sanitizeStringArray(body.questionnaire.nutrition?.supplementUse)
              },
              preferences: {
                ...body.questionnaire.preferences,
                favouriteExercises: sanitizeStringArray(body.questionnaire.preferences?.favouriteExercises),
                dislikedExercises: sanitizeStringArray(body.questionnaire.preferences?.dislikedExercises)
              }
            }
          : body?.questionnaire
      };

        const parsed = GeneratePlanRequestSchema.safeParse(sanitizedBody);

        if (!parsed.success) {
          send('error', {
            message: parsed.error.errors[0]?.message || 'Invalid request body'
          });
          controller.close();
          return;
        }

        const { questionnaire, existingPlan } = parsed.data;
        sendProgress(15, 'prepare', 'Preparing AI request');

        const start = Date.now();
        let progress = 20;
        const ticker = setInterval(() => {
          const elapsed = Math.floor((Date.now() - start) / 1000);
          progress = Math.min(progress + 2, 90);
          sendProgress(progress, 'generate', `AI is generating your plan (${elapsed}s)`);
        }, 4000);

        try {
          sendProgress(25, 'generate', 'Contacting AI model');
          const plan = await generatePlan(questionnaire, existingPlan);
          clearInterval(ticker);
          sendProgress(95, 'finalize', 'Finalizing plan');
          sendProgress(100, 'complete', 'Plan ready');
          send('result', { plan });
        } catch (error) {
          clearInterval(ticker);
          console.error('Generate plan error:', error);
          send('error', {
            message: error instanceof Error ? error.message : 'Failed to generate plan'
          });
        }
      } catch (error) {
        console.error('Generate plan error:', error);
        send('error', {
          message: error instanceof Error ? error.message : 'Failed to generate plan'
        });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
}
