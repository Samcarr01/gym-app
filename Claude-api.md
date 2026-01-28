# API Module – Purpose

Expose a single endpoint for generating gym plans from questionnaire data.

## Features

### Endpoint: /api/generate-plan

#### Constraints
- **Must be a POST endpoint**
- **Must validate input with Zod**
- **Must handle errors gracefully**
- **Must return JSON response**
- *Should complete within 30 seconds*

#### Method
POST

#### Request Body

```typescript
interface GeneratePlanRequest {
  questionnaire: QuestionnaireData;
  existingPlan?: string;
}
```

#### Response (Success)

```typescript
interface GeneratePlanResponse {
  success: true;
  plan: GeneratedPlan;
}
```

#### Response (Error)

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
```

#### Error Codes
- `VALIDATION_ERROR` – Invalid request body
- `AI_ERROR` – OpenAI API failure
- `TIMEOUT_ERROR` – Request took too long
- `UNKNOWN_ERROR` – Unexpected error

### Implementation

#### Route Handler

```typescript
// app/api/generate-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generatePlan } from '@/lib/openai';
import { GeneratePlanRequestSchema } from '@/lib/types';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const parsed = GeneratePlanRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.errors[0].message
        }
      }, { status: 400 });
    }
    
    const { questionnaire, existingPlan } = parsed.data;
    
    // Generate plan
    const plan = await generatePlan(questionnaire, existingPlan);
    
    return NextResponse.json({
      success: true,
      plan
    });
    
  } catch (error) {
    console.error('Generate plan error:', error);
    
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'TIMEOUT_ERROR',
          message: 'Plan generation took too long. Please try again.'
        }
      }, { status: 504 });
    }
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'AI_ERROR',
        message: 'Failed to generate plan. Please try again.'
      }
    }, { status: 500 });
  }
}
```

### Request Validation Schema

```typescript
// lib/types.ts
import { z } from 'zod';

const GoalsSectionSchema = z.object({
  primaryGoal: z.enum([
    'muscle_building',
    'fat_loss',
    'strength',
    'endurance',
    'general_fitness',
    'sport_specific'
  ]),
  secondaryGoal: z.enum([
    'muscle_building',
    'fat_loss',
    'strength',
    'endurance',
    'general_fitness',
    'sport_specific'
  ]).nullable(),
  timeframe: z.string(),
  specificTargets: z.array(z.string())
});

const ExperienceSectionSchema = z.object({
  trainingYears: z.number().min(0).max(30),
  currentLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  recentTraining: z.string(),
  strongPoints: z.array(z.string()),
  weakPoints: z.array(z.string())
});

const AvailabilitySectionSchema = z.object({
  daysPerWeek: z.number().min(1).max(7),
  sessionDuration: z.number().min(30).max(180),
  preferredDays: z.array(z.string()),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'flexible'])
});

const EquipmentSectionSchema = z.object({
  gymAccess: z.boolean(),
  gymType: z.enum(['commercial', 'home', 'hotel', 'outdoor']).nullable(),
  availableEquipment: z.array(z.string()),
  limitedEquipment: z.array(z.string())
});

const InjuryRecordSchema = z.object({
  area: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  notes: z.string()
});

const InjuriesSectionSchema = z.object({
  currentInjuries: z.array(InjuryRecordSchema),
  pastInjuries: z.array(InjuryRecordSchema),
  movementRestrictions: z.array(z.string()),
  painAreas: z.array(z.string())
});

const RecoverySectionSchema = z.object({
  sleepHours: z.number().min(3).max(12),
  sleepQuality: z.enum(['poor', 'fair', 'good', 'excellent']),
  stressLevel: z.enum(['low', 'moderate', 'high', 'very_high']),
  recoveryCapacity: z.enum(['low', 'moderate', 'high'])
});

const NutritionSectionSchema = z.object({
  nutritionApproach: z.enum(['maintenance', 'surplus', 'deficit', 'intuitive']),
  proteinIntake: z.enum(['low', 'moderate', 'high', 'very_high']),
  dietaryRestrictions: z.array(z.string()),
  supplementUse: z.array(z.string())
});

const PreferencesSectionSchema = z.object({
  favouriteExercises: z.array(z.string()),
  dislikedExercises: z.array(z.string()),
  preferredSplit: z.enum([
    'full_body',
    'upper_lower',
    'push_pull_legs',
    'bro_split',
    'custom'
  ]).nullable(),
  cardioPreference: z.enum(['none', 'minimal', 'moderate', 'extensive'])
});

const ConstraintsSectionSchema = z.object({
  maxExercisesPerSession: z.number().nullable(),
  timeConstraints: z.string(),
  otherNotes: z.string()
});

export const QuestionnaireDataSchema = z.object({
  goals: GoalsSectionSchema,
  experience: ExperienceSectionSchema,
  availability: AvailabilitySectionSchema,
  equipment: EquipmentSectionSchema,
  injuries: InjuriesSectionSchema,
  recovery: RecoverySectionSchema,
  nutrition: NutritionSectionSchema,
  preferences: PreferencesSectionSchema,
  constraints: ConstraintsSectionSchema
});

export const GeneratePlanRequestSchema = z.object({
  questionnaire: QuestionnaireDataSchema,
  existingPlan: z.string().optional()
});

export type QuestionnaireData = z.infer<typeof QuestionnaireDataSchema>;
export type GeneratePlanRequest = z.infer<typeof GeneratePlanRequestSchema>;
```

### Client-Side Fetching

```typescript
// lib/api.ts
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
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error.message);
  }
  
  return data.plan;
}
```

### Rate Limiting (Optional)

For friends-only use, rate limiting is optional. If needed:

```typescript
// Simple in-memory rate limit
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5;
  
  const requests = rateLimitMap.get(ip) || [];
  const recentRequests = requests.filter(t => now - t < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return true;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return false;
}
```

### CORS Configuration

Not required for same-origin requests from Vercel deployment.

### Environment Variables

```
OPENAI_API_KEY=sk-...
```

**Must not** be exposed to client. Only available in server-side code.
