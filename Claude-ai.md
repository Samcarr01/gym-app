# AI Module – Purpose

Transform questionnaire inputs into structured, personalised gym plans using GPT-5.2.

## Features

### Plan Generation

#### Constraints
- **Must use OpenAI SDK with gpt-5.2 model**
- **Must apply system instructions before user input**
- **Must return structured JSON output**
- **Must respect all injury restrictions**
- **Must include exercise substitutions**
- *Should complete in under 30 seconds*

#### Input Processing

1. Receive questionnaire data as JSON
2. Optionally receive existing plan text (update mode)
3. Build prompt with system instructions + user context
4. Call OpenAI API
5. Parse and validate response
6. Return structured plan

### System Instructions

#### Core Prompt

```
You are an expert strength and conditioning coach with 20+ years of experience. 
You create personalised training programmes that are:

1. SAFE – Never prescribe exercises that conflict with stated injuries
2. EFFECTIVE – Based on proven training principles
3. ADHERENT – Designed around the user's actual schedule and equipment
4. PROGRESSIVE – Include clear progression guidance

Your tone is calm, professional, and encouraging. You explain the "why" behind 
each recommendation without being preachy.

CRITICAL RULES:
- If an injury is marked HIGH severity, completely avoid that movement pattern
- If equipment is limited, substitute with available alternatives
- Always include warm-up and cool-down guidance
- Default to conservative volume for beginners
- Include rest day recommendations
```

#### Output Schema

```
Return a JSON object with this exact structure:
{
  "planName": "string - descriptive name for this plan",
  "overview": "string - 2-3 sentence summary",
  "weeklyStructure": "string - e.g., 'Push/Pull/Legs with 2 rest days'",
  "days": [
    {
      "dayNumber": number,
      "name": "string - e.g., 'Push Day'",
      "focus": "string - muscle groups targeted",
      "duration": "string - estimated time",
      "warmup": {
        "description": "string",
        "exercises": ["string"]
      },
      "exercises": [
        {
          "name": "string",
          "sets": number,
          "reps": "string - e.g., '8-12' or '5x5'",
          "rest": "string - e.g., '90 seconds'",
          "intent": "string - why this exercise",
          "notes": "string - form cues or variations",
          "substitutions": ["string - alternative exercises"]
        }
      ],
      "cooldown": {
        "description": "string",
        "exercises": ["string"]
      }
    }
  ],
  "progressionGuidance": "string - how to progress over time",
  "nutritionNotes": "string - brief dietary suggestions",
  "recoveryNotes": "string - rest and recovery advice",
  "disclaimer": "Consult a healthcare professional before starting any exercise program."
}
```

### Update Mode Logic

#### When Existing Plan Provided

```
The user has an existing plan they want to update. Here is their current plan:

---
{existingPlanText}
---

Based on their updated questionnaire responses, modify this plan to:
1. Address any new injuries or restrictions
2. Adjust volume/intensity based on their current recovery capacity
3. Incorporate their preferred exercises where appropriate
4. Maintain exercises they're progressing well on
5. Remove or substitute exercises that conflict with new constraints

Preserve the general structure if it was working well, but don't hesitate to 
make significant changes if their situation has changed substantially.
```

### Prompt Assembly

#### Function: buildPrompt

```typescript
function buildPrompt(
  questionnaire: QuestionnaireData,
  existingPlan?: string
): { system: string; user: string } {
  const system = SYSTEM_INSTRUCTIONS;
  
  let user = `
## User Profile

### Goals
- Primary: ${questionnaire.goals.primaryGoal}
- Secondary: ${questionnaire.goals.secondaryGoal || 'None'}
- Timeframe: ${questionnaire.goals.timeframe}
- Specific targets: ${questionnaire.goals.specificTargets.join(', ') || 'None'}

### Experience
- Training years: ${questionnaire.experience.trainingYears}
- Level: ${questionnaire.experience.currentLevel}
- Recent training: ${questionnaire.experience.recentTraining}
- Strong points: ${questionnaire.experience.strongPoints.join(', ')}
- Weak points: ${questionnaire.experience.weakPoints.join(', ')}

### Availability
- Days per week: ${questionnaire.availability.daysPerWeek}
- Session duration: ${questionnaire.availability.sessionDuration} minutes
- Preferred days: ${questionnaire.availability.preferredDays.join(', ')}
- Time of day: ${questionnaire.availability.timeOfDay}

### Equipment
- Gym access: ${questionnaire.equipment.gymAccess ? 'Yes' : 'No'}
- Gym type: ${questionnaire.equipment.gymType || 'N/A'}
- Available: ${questionnaire.equipment.availableEquipment.join(', ')}
- Limited: ${questionnaire.equipment.limitedEquipment.join(', ') || 'None'}

### Injuries (CRITICAL - MUST RESPECT)
${formatInjuries(questionnaire.injuries)}

### Recovery
- Sleep: ${questionnaire.recovery.sleepHours} hours (${questionnaire.recovery.sleepQuality})
- Stress: ${questionnaire.recovery.stressLevel}
- Recovery capacity: ${questionnaire.recovery.recoveryCapacity}

### Nutrition
- Approach: ${questionnaire.nutrition.nutritionApproach}
- Protein: ${questionnaire.nutrition.proteinIntake}
- Restrictions: ${questionnaire.nutrition.dietaryRestrictions.join(', ') || 'None'}

### Preferences
- Favourite exercises: ${questionnaire.preferences.favouriteExercises.join(', ') || 'None'}
- Disliked exercises: ${questionnaire.preferences.dislikedExercises.join(', ') || 'None'}
- Preferred split: ${questionnaire.preferences.preferredSplit || 'No preference'}
- Cardio: ${questionnaire.preferences.cardioPreference}

### Additional Constraints
${questionnaire.constraints.otherNotes || 'None'}
`;

  if (existingPlan) {
    user = UPDATE_MODE_PROMPT.replace('{existingPlanText}', existingPlan) + user;
  }

  return { system, user };
}
```

### Response Validation

#### Schema Validation

```typescript
const PlanSchema = z.object({
  planName: z.string().min(1),
  overview: z.string().min(10),
  weeklyStructure: z.string(),
  days: z.array(z.object({
    dayNumber: z.number(),
    name: z.string(),
    focus: z.string(),
    duration: z.string(),
    warmup: z.object({
      description: z.string(),
      exercises: z.array(z.string())
    }),
    exercises: z.array(z.object({
      name: z.string(),
      sets: z.number(),
      reps: z.string(),
      rest: z.string(),
      intent: z.string(),
      notes: z.string(),
      substitutions: z.array(z.string())
    })),
    cooldown: z.object({
      description: z.string(),
      exercises: z.array(z.string())
    })
  })),
  progressionGuidance: z.string(),
  nutritionNotes: z.string(),
  recoveryNotes: z.string(),
  disclaimer: z.string()
});
```

### Error Handling

#### Failure Modes
- **API timeout**: Return friendly error, suggest retry
- **Invalid JSON**: Attempt to parse, fallback to raw text display
- **Schema mismatch**: Log error, return partial plan with warning
- **Rate limit**: Queue request, show loading state

## OpenAI Client

### Configuration

```typescript
// lib/openai.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePlan(
  questionnaire: QuestionnaireData,
  existingPlan?: string
): Promise<GeneratedPlan> {
  const { system, user } = buildPrompt(questionnaire, existingPlan);
  
  const response = await openai.chat.completions.create({
    model: 'gpt-5.2',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 4000
  });

  const content = response.choices[0].message.content;
  const parsed = JSON.parse(content);
  
  return PlanSchema.parse(parsed);
}
```

## Injury Safety Logic

### High-Severity Injury Handling

```typescript
const INJURY_MOVEMENT_MAP: Record<string, string[]> = {
  'lower_back': ['deadlift', 'bent_over_row', 'good_morning', 'back_squat'],
  'shoulder': ['overhead_press', 'lateral_raise', 'upright_row', 'dips'],
  'knee': ['squat', 'lunge', 'leg_extension', 'jump'],
  'wrist': ['barbell_curl', 'push_up', 'front_squat'],
  'elbow': ['tricep_extension', 'skull_crusher', 'close_grip_bench'],
  'neck': ['shrug', 'upright_row', 'overhead_press'],
  'hip': ['squat', 'deadlift', 'lunge', 'leg_press']
};

function getRestrictedMovements(injuries: InjuryRecord[]): string[] {
  return injuries
    .filter(i => i.severity === 'high')
    .flatMap(i => INJURY_MOVEMENT_MAP[i.area.toLowerCase()] || []);
}
```

### Prompt Injection

Restricted movements are explicitly listed in the prompt:

```
MOVEMENTS TO COMPLETELY AVOID (high-severity injuries):
${restrictedMovements.join(', ')}

These exercises or similar movement patterns must NOT appear in the plan.
```
