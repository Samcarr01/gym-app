import { NextRequest, NextResponse } from 'next/server';
import { generatePlan } from '@/lib/openai';
import { GeneratePlanRequestSchema } from '@/lib/types';

// Allow more time for plan generation on Vercel
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const sanitizeStringArray = (value: unknown): string[] => {
      const items: string[] = [];

      const pushItem = (raw: string) => {
        raw
          .split(/[,\n;]+/)
          .map((item) => item.trim())
          .filter(Boolean)
          .forEach((item) => items.push(item));
      };

      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'string') pushItem(item);
        }
      } else if (typeof value === 'string') {
        pushItem(value);
      }

      return Array.from(new Set(items));
    };

    const sanitizeInjuries = (value: unknown) => {
      if (!Array.isArray(value)) return [];
      return value
        .filter((item) => item && typeof item === 'object')
        .map((item) => ({
          area:
            typeof (item as any).area === 'string'
              ? (item as any).area.trim()
              : '',
          severity: (item as any).severity ?? 'medium',
          notes: typeof (item as any).notes === 'string' ? (item as any).notes : ''
        }))
        .filter((item) => item.area.length > 0);
    };

    const sanitizedBody = {
      ...body,
      questionnaire: body?.questionnaire
        ? {
            ...body.questionnaire,
            goals: {
              ...body.questionnaire.goals,
              secondaryGoal:
                body.questionnaire.goals?.secondaryGoal === '' ? null : body.questionnaire.goals?.secondaryGoal,
              specificTargets: sanitizeStringArray(body.questionnaire.goals?.specificTargets)
            },
            experience: {
              ...body.questionnaire.experience,
              strongPoints: sanitizeStringArray(body.questionnaire.experience?.strongPoints),
              weakPoints: sanitizeStringArray(body.questionnaire.experience?.weakPoints),
              currentBodyWeight: body.questionnaire.experience?.currentBodyWeight || undefined,
              currentLifts: body.questionnaire.experience?.currentLifts ? {
                squat: body.questionnaire.experience.currentLifts.squat || undefined,
                bench: body.questionnaire.experience.currentLifts.bench || undefined,
                deadlift: body.questionnaire.experience.currentLifts.deadlift || undefined,
                overheadPress: body.questionnaire.experience.currentLifts.overheadPress || undefined
              } : undefined
            },
            equipment: {
              ...body.questionnaire.equipment,
              gymType:
                body.questionnaire.equipment?.gymType === '' ? null : body.questionnaire.equipment?.gymType,
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
              preferredSplit:
                body.questionnaire.preferences?.preferredSplit === ''
                  ? null
                  : body.questionnaire.preferences?.preferredSplit,
              favouriteExercises: sanitizeStringArray(body.questionnaire.preferences?.favouriteExercises),
              dislikedExercises: sanitizeStringArray(body.questionnaire.preferences?.dislikedExercises)
            }
          }
        : body?.questionnaire
    };

    // Validate input
    const parsed = GeneratePlanRequestSchema.safeParse(sanitizedBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.errors[0]?.message || 'Invalid request body'
          }
        },
        { status: 400 }
      );
    }

    const { questionnaire, existingPlan } = parsed.data;

    // Generate the plan
    const plan = await generatePlan(questionnaire, existingPlan);

    return NextResponse.json({
      success: true,
      plan
    });

  } catch (error) {
    console.error('Generate plan error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      // Timeout error
      if (error.message.includes('timeout') || error.message.includes('timed out')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'TIMEOUT_ERROR',
              message: 'Plan generation took too long. Please try again.'
            }
          },
          { status: 504 }
        );
      }

      // OpenAI API errors
      if (error.message.includes('API') || error.message.includes('rate limit')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'AI_ERROR',
              message: 'AI service temporarily unavailable. Please try again in a moment.'
            }
          },
          { status: 503 }
        );
      }

      // JSON parsing errors (invalid AI response)
      if (error.message.includes('JSON') || error.message.includes('parse')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PARSE_ERROR',
              message: 'Failed to process AI response. Please try again.'
            }
          },
          { status: 500 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred. Please try again.'
        }
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/generate-plan',
    method: 'POST'
  });
}
