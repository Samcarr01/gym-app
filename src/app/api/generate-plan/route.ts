import { NextRequest, NextResponse } from 'next/server';
import { generatePlan } from '@/lib/openai';
import { GeneratePlanRequestSchema } from '@/lib/types';

// Allow up to 30 seconds for plan generation
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = GeneratePlanRequestSchema.safeParse(body);

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
