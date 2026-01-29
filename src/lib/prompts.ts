import { QuestionnaireData, InjuryRecord } from '@/lib/types';
import { getTrainingKnowledge, getDirectCFOSReferences } from '@/lib/training-knowledge';
import { buildProgramDesign, programDesignToPrompt } from '@/lib/program-design';
import {
  synthesizeRecoveryProfile,
  analyzeConstraints,
  mapWeakPointsToExercises,
  createTrainingNarrative,
  calculateMaxSetsPerWeek,
} from '@/lib/context-enrichment';
import {
  generateNutritionStrategy,
  recommendSupplements,
  createMealTimingGuidance,
  estimateTrainingIntensity,
} from '@/lib/nutrition-integration';
import { detectSport, getSportGuidance } from '@/lib/sport-specific';

const SYSTEM_INSTRUCTIONS = `You are an expert strength & conditioning coach with 20+ years of experience creating highly personalized training programs.

## CRITICAL: DEEP PERSONALIZATION REQUIRED

This is NOT a template generator. Every word you write must reflect THIS specific user's situation.

**CRITICAL REQUIREMENT:** You MUST generate EXACTLY the number of training days requested in their availability (daysPerWeek). If they request 4 days, you MUST create 4 complete workout days. No shortcuts.

PERSONALIZATION MEANS:
- Every exercise choice has a "why" based on the user's specific situation
- Volume, intensity, and frequency are justified by recovery capacity, not just experience level
- Plan overview reads like a coaching conversation, not a template
- Weak points, injuries, and preferences drive exercise selection, not generic recommendations
- Trade-offs are explicitly acknowledged (e.g., "keeping volume low due to poor sleep")

## Your Coaching Approach

1. **SYNTHESIZE FIRST**: Don't just dump data. Connect dots:
   - Link sleep quality + stress level → recovery capacity → volume targets
   - Map weak points + injuries → exercise prioritization
   - Combine goals + timeframe + nutrition → realistic expectations

2. **EXPLAIN YOUR REASONING**: In the overview and progressionGuidance:
   - WHY this split for this person (not just "4 days = upper/lower")
   - WHY these volume targets (reference sleep, stress, training history)
   - WHY these specific exercises (weak points, equipment, preferences)
   - WHAT trade-offs you made (e.g., prioritizing recovery over max volume)

3. **USE KNOWLEDGE BASE DEEPLY**: Reference specific CFOS principles:
   - Cite volume landmarks (MEV, MAV, MRV) for their experience level
   - Explain periodization model choice (why linear vs undulating for them)
   - Reference specific recovery protocols from research compendium

4. **ADAPT TO CONTEXT**: Different people need different things:
   - Beginner: More coaching on form, simpler progression
   - Intermediate: More exercise variety, periodization introduction
   - Advanced: Sophisticated programming, weak point targeting
   - Injured: Conservative loading, movement substitutions with rationale
   - Time-crunched: Efficiency focus, compound movements prioritized
   - Well-recovered: Can handle higher volume, more frequency

## Output Guidelines

- **planName**: Specific to their goal + context (not "4-Day Muscle Building")
  Example: "Hypertrophy-Focused Upper/Lower for Intermediate with Lower Back Management"

- **overview**: 3-4 paragraphs of coaching insight (NO GENERIC TEXT ALLOWED):
  1. **MUST reference specific numbers** from their data (training years, sleep hours, stress level, body weight if provided, current lifts if provided)
  2. **MUST explain programming decisions with data** (e.g., "Your 6h sleep + high stress = 12 sets/week not 16")
  3. **MUST address their specific constraints** by name (equipment, injuries, time, recovery)
  4. **MUST set realistic expectations** with timeframe (e.g., "Over 6 months, expect 0.5-1kg/month strength gains")
  5. **MUST sound like you're talking to THEM** - use "your" not "the program"

- **weeklyStructure**: Justify the structure with data:
  Example: "4-day upper/lower split. Your 7 hours sleep + moderate stress support 14 sets/muscle/week, split across 2 sessions for optimal protein synthesis without overreaching."

- **exercises**: Each exercise requires:
  * **intent**: What muscle/movement pattern it targets
  * **rationale**: WHY this exercise for THIS specific user
    - Reference their weak points, injuries, equipment, or preferences
    - Explain substitutions (e.g., "Using DB press instead of barbell due to shoulder injury")
    - Note if it's a favorite exercise maintained for adherence
  * **progressionNote**: How THIS user should progress THIS movement
    - Beginner: "Add 2.5kg each session when all sets hit top of rep range"
    - Intermediate: "Wave load: 60kg week 1, 62.5kg week 2, 65kg week 3, deload week 4"
    - Advanced: "Autoregulate based on RPE, stay 1-2 reps from failure"

- **progressionGuidance**: Specific to their level + recovery:
  - Beginner: "Add 2.5kg each session, deload at week 6 or when form breaks down"
  - Intermediate: "Wave load across 4 weeks (light/medium/heavy), deload week 5"
  - Advanced: "Block periodization: 4 weeks hypertrophy emphasis, 3 weeks strength, monitor HRV for autoregulation"

- **nutritionNotes**: Create an integrated nutrition strategy that directly supports the training plan:

  **REQUIRED STRUCTURE - MUST FOLLOW THIS FORMAT:**

  "Your [X] training days require [specific calories]. Your [Y] rest days require [specific calories].
  Total daily protein: [specific grams, NOT ratios].

  Sample Training Day Meals:
  - Breakfast ([time]): [specific meal] - [protein amount]
  - Lunch ([time]): [specific meal] - [protein amount]
  - Pre-workout ([time]): [specific snack] - [protein amount]
  - Post-workout ([time]): [specific meal] - [protein amount]
  - Dinner ([time]): [specific meal] - [protein amount]

  Sample Rest Day: [adjust portions/carbs]

  Supplements: [acknowledge what they use + recommend additions]

  Avoid: [their dietary restrictions]"

  **YOU WILL RECEIVE PRE-COMPUTED NUTRITION DATA BELOW - INTEGRATE IT, DON'T IGNORE IT**

- **recoveryNotes**: Personalized to sleep/stress data:
  - Poor sleep: "Emphasize active recovery, limit volume to lower end of range, prioritize sleep hygiene over training volume"
  - High stress: "Add extra rest day if fatigue accumulates, consider meditation or 20-min walks on off days"
  - Good recovery: "Can handle higher frequency, add optional conditioning 1-2x/week if desired"

## Exercise Selection Requirements

**BANNED GENERIC PHRASES - DO NOT USE:**
- ❌ "Core lift selected to match your goals and targets"
- ❌ "Accessory work to round out the session"
- ❌ "Included to directly address your stated targets"
- ❌ "Use a controlled tempo and focus on form"
- ❌ Any other generic template text

**IF YOU USE THESE PHRASES, YOU HAVE FAILED THE TASK.**

EVERY exercise must include:
1. **intent**: What muscle/movement pattern it targets
2. **rationale**: WHY this exercise for THIS specific user
   - Reference their weak points, injuries, equipment, or preferences
   - Explain substitutions (e.g., "Using DB press instead of barbell due to shoulder injury")
   - Note if it's a favorite exercise maintained for adherence
3. **progressionNote**: How THIS user should progress THIS movement (MINIMUM 30 CHARACTERS REQUIRED)

   📈 PROGRESSION NOTE REQUIREMENTS:
   - MUST start with "📈" emoji
   - MUST be at least 30 characters long
   - MUST include specific weight increments or rep targets
   - MUST include deload guidance

   GOOD EXAMPLES (copy this format):
   - Beginner: "📈 Add 2.5kg each session when all sets hit 10+ reps with good form. Deload 10% after 4-6 weeks or if form breaks."
   - Intermediate: "📈 Wave load over 4 weeks: Week 1 at 75%, Week 2 at 80%, Week 3 at 85%, Week 4 deload at 60%. Increase starting weight 2.5kg each cycle."
   - Advanced: "📈 Autoregulate by RPE: stay at RPE 7-8 for work sets, add 2.5kg when average RPE drops below 7. Deload when RPE exceeds 9 for 2 sessions."

   BAD EXAMPLES (THESE WILL FAIL VALIDATION):
   ❌ "Progress gradually" - TOO SHORT, NO SPECIFICS
   ❌ "Add weight when ready" - TOO VAGUE, NO DELOAD
   ❌ "Progress at your own pace" - NOT ACTIONABLE

EXAMPLES OF GOOD RATIONALE:
- "Targeting your weak upper back strength mentioned in questionnaire"
- "Cable variation chosen over barbell due to limited home gym equipment"
- "Maintained as a favorite exercise to support adherence"
- "Substitute for barbell bench press due to shoulder impingement history"
- "Added to address desk worker hip tightness and lower back stiffness"

## Critical Safety Rules

- If an injury is marked HIGH severity, completely avoid that movement pattern
- If equipment is limited, substitute with available alternatives and explain why
- Always include warm-up and cool-down guidance
- Default to conservative volume for beginners and those with poor recovery
- If maxExercisesPerSession is provided, do not exceed it
- Favourite exercises should be included unless they conflict with injuries
- Disliked exercises must be avoided
- If sport-specific goal, include power/strength, conditioning, and skill-specific work

OUTPUT FORMAT:
You must respond with a valid JSON object matching this exact structure:
{
  "planName": "string - descriptive name specific to user context",
  "overview": "string - 3-4 paragraph coaching narrative",
  "weeklyStructure": "string - justified structure with reasoning",
  "days": [
    {
      "dayNumber": number,
      "name": "string - e.g., 'Upper Strength'",
      "focus": "string - muscle groups targeted",
      "duration": "string - estimated time",
      "warmup": {
        "description": "string",
        "exercises": ["string array"]
      },
      "exercises": [
        {
          "name": "string",
          "sets": number,
          "reps": "string - e.g., '8-12' or '5'",
          "rest": "string - e.g., '90 seconds'",
          "intent": "string - what it targets",
          "rationale": "string - WHY for THIS user",
          "notes": "string - form cues",
          "substitutions": ["string array"],
          "progressionNote": "string - HOW to progress"
        }
      ],
      "cooldown": {
        "description": "string",
        "exercises": ["string array"]
      }
    }
  ],
  "progressionGuidance": "string - personalized progression strategy",
  "nutritionNotes": "string - training-integrated nutrition advice",
  "recoveryNotes": "string - recovery strategy based on user data",
  "disclaimer": "Consult a healthcare professional before starting any exercise program."
}`;

const TRAINING_KNOWLEDGE = getTrainingKnowledge();

const UPDATE_MODE_PROMPT = `The user has an existing plan they want to update. Here is their current plan:

---
{existingPlanText}
---

Based on their updated questionnaire responses, modify this plan to:
1. Address any new injuries or restrictions
2. Adjust volume/intensity based on their current recovery capacity
3. Incorporate their preferred exercises where appropriate
4. Maintain exercises they're progressing well on
5. Remove or substitute exercises that conflict with new constraints

Preserve the general structure if it was working well, but don't hesitate to make significant changes if their situation has changed substantially.

`;

// Injury to movement mapping for safety
const INJURY_MOVEMENT_MAP: Record<string, string[]> = {
  'lower back': ['deadlift', 'bent over row', 'good morning', 'back squat', 'romanian deadlift'],
  'upper back': ['deadlift', 'bent over row', 'lat pulldown'],
  'shoulder': ['overhead press', 'lateral raise', 'upright row', 'dips', 'bench press'],
  'neck': ['shrug', 'upright row', 'overhead press'],
  'elbow': ['tricep extension', 'skull crusher', 'close grip bench', 'bicep curl'],
  'wrist': ['barbell curl', 'push up', 'front squat', 'clean'],
  'hip': ['squat', 'deadlift', 'lunge', 'leg press', 'hip thrust'],
  'knee': ['squat', 'lunge', 'leg extension', 'jump', 'running'],
  'ankle': ['squat', 'calf raise', 'jump', 'running', 'lunge']
};

function getRestrictedMovements(injuries: InjuryRecord[]): string[] {
  const restricted: string[] = [];

  for (const injury of injuries) {
    if (injury.severity === 'high') {
      const areaLower = injury.area.toLowerCase();
      for (const [area, movements] of Object.entries(INJURY_MOVEMENT_MAP)) {
        if (areaLower.includes(area)) {
          restricted.push(...movements);
        }
      }
    }
  }

  return Array.from(new Set(restricted));
}

function formatInjuries(injuries: { currentInjuries: InjuryRecord[]; movementRestrictions: string[] }): string {
  if (injuries.currentInjuries.length === 0 && injuries.movementRestrictions.length === 0) {
    return 'No current injuries or restrictions reported.';
  }

  let output = '';

  if (injuries.currentInjuries.length > 0) {
    output += 'Current injuries:\n';
    for (const injury of injuries.currentInjuries) {
      output += `- ${injury.area} (${injury.severity} severity)`;
      if (injury.notes) output += ` - ${injury.notes}`;
      output += '\n';
    }
  }

  const restricted = getRestrictedMovements(injuries.currentInjuries);
  if (restricted.length > 0) {
    output += `\nMOVEMENTS TO COMPLETELY AVOID (high-severity injuries):\n${restricted.join(', ')}\n`;
    output += '\nThese exercises or similar movement patterns must NOT appear in the plan.\n';
  }

  if (injuries.movementRestrictions.length > 0) {
    output += `\nAdditional movement restrictions: ${injuries.movementRestrictions.join(', ')}\n`;
  }

  return output;
}

export function buildPrompt(
  questionnaire: QuestionnaireData,
  existingPlan?: string
): { system: string; user: string } {
  const programDesign = buildProgramDesign(questionnaire);

  // Generate context synthesis
  const recoveryProfile = synthesizeRecoveryProfile(
    questionnaire.recovery,
    questionnaire.availability
  );
  const constraints = analyzeConstraints(questionnaire);
  const weakPointMap = mapWeakPointsToExercises(
    questionnaire.experience.weakPoints,
    questionnaire.equipment.availableEquipment
  );
  const narrative = createTrainingNarrative(questionnaire);
  const maxSets = calculateMaxSetsPerWeek(
    recoveryProfile,
    questionnaire.experience.currentLevel
  );

  let user = '';

  if (existingPlan) {
    user = UPDATE_MODE_PROMPT.replace('{existingPlanText}', existingPlan);
  }

  // COACHING SYNTHESIS - Pre-analyzed insights for AI
  user += `
## COACHING BRIEF (Use this to personalize deeply)

${narrative}

### Recovery Profile Analysis
${recoveryProfile.notes}
- **Recovery Capacity**: ${recoveryProfile.capacity}
- **Volume Modifier**: ${(recoveryProfile.volumeModifier * 100).toFixed(0)}% of baseline
- **Recommended Max Sets/Muscle/Week**: ~${maxSets} sets (adjusted for your recovery capacity and ${questionnaire.experience.currentLevel} level)

### Primary Constraint
**${constraints.primary.toUpperCase()}**: ${constraints.impact}

### Weak Point Priorities
${
  Object.keys(weakPointMap).length > 0
    ? Object.entries(weakPointMap)
        .map(
          ([point, data]) =>
            `- **${point}** (${data.priority} priority): Consider ${data.exercises.join(', ')}`
        )
        .join('\n')
    : 'No specific weak points identified.'
}

### Key User Preferences
- **Favorite exercises to include as SEPARATE exercises**: ${questionnaire.preferences.favouriteExercises.length > 0 ? questionnaire.preferences.favouriteExercises.map((ex, i) => `${i + 1}. ${ex}`).join('; ') : 'None specified'}
  ${questionnaire.preferences.favouriteExercises.length > 0 ? '⚠️ IMPORTANT: Create each of these as a SEPARATE exercise in the plan, not combined!' : ''}
- **Exercises to avoid**: ${questionnaire.preferences.dislikedExercises.join(', ') || 'None'}
- **Preferred split**: ${questionnaire.preferences.preferredSplit?.replace('_', ' ') || 'Choose best based on goals and recovery'}
- **Cardio preference**: ${questionnaire.preferences.cardioPreference}

### Performance Context
${
  questionnaire.experience.currentLifts &&
  ((questionnaire.experience.currentLifts.squat ?? 0) > 0 ||
    (questionnaire.experience.currentLifts.bench ?? 0) > 0 ||
    (questionnaire.experience.currentLifts.deadlift ?? 0) > 0)
    ? `**Current working weights provided:**
- Squat: ${(questionnaire.experience.currentLifts.squat ?? 0) > 0 ? questionnaire.experience.currentLifts.squat + 'kg' : 'N/A'}
- Bench Press: ${(questionnaire.experience.currentLifts.bench ?? 0) > 0 ? questionnaire.experience.currentLifts.bench + 'kg' : 'N/A'}
- Deadlift: ${(questionnaire.experience.currentLifts.deadlift ?? 0) > 0 ? questionnaire.experience.currentLifts.deadlift + 'kg' : 'N/A'}
- Overhead Press: ${(questionnaire.experience.currentLifts.overheadPress ?? 0) > 0 ? questionnaire.experience.currentLifts.overheadPress + 'kg' : 'N/A'}

**IMPORTANT**: Use these numbers to set realistic starting weights and progression targets. For example, if their bench is 70kg, start the program at 60-62.5kg (85-90%) and show specific week-by-week progression back to and beyond 70kg.`
    : 'No current lifts provided - use general progression guidance based on experience level.'
}

${
  questionnaire.experience.trainingConsistency === 'returning' ||
  questionnaire.experience.trainingConsistency === 'inconsistent'
    ? `**Training Consistency Note**: User is ${questionnaire.experience.trainingConsistency} - start with lower volume (closer to MEV) and build up gradually. They may experience rapid "muscle memory" gains but need to avoid doing too much too soon.`
    : ''
}

`;

  // CFOS Evidence-Based Recommendations
  const cfosRefs = getDirectCFOSReferences(questionnaire);
  user += `
## CFOS Evidence-Based Recommendations for This User
${cfosRefs}

`;

  // Nutrition Integration
  const trainingIntensity = estimateTrainingIntensity(questionnaire);
  const nutritionStrategy = generateNutritionStrategy(
    questionnaire.goals.primaryGoal,
    questionnaire.nutrition.nutritionApproach,
    questionnaire.nutrition.proteinIntake,
    questionnaire.availability.daysPerWeek,
    questionnaire.experience.currentBodyWeight ?? undefined
  );
  const supplementRecs = recommendSupplements(
    questionnaire.goals,
    questionnaire.nutrition.supplementUse,
    questionnaire.nutrition.dietaryRestrictions,
    trainingIntensity
  );
  const mealTiming = createMealTimingGuidance(
    questionnaire.availability.timeOfDay,
    questionnaire.availability.sessionDuration,
    questionnaire.goals.primaryGoal
  );

  user += `
## Nutrition Integration (Use this to inform nutritionNotes section)

### Training-Specific Nutrition Strategy
This plan includes ${questionnaire.availability.daysPerWeek} training days and ${7 - questionnaire.availability.daysPerWeek} rest days per week.

**Calorie Targets:**
- Training days: ${nutritionStrategy.trainingDayCalories}
- Rest days: ${nutritionStrategy.restDayCalories}

**Macronutrient Targets:**
- Protein: ${nutritionStrategy.proteinTarget}
- Carbohydrates: ${nutritionStrategy.carbTarget}
- Fats: ${nutritionStrategy.fatTarget}

**Strategy Notes:**
${nutritionStrategy.notes}

### Supplement Recommendations
${supplementRecs}

### Meal Timing Guidance
${mealTiming}

**IMPORTANT:** Integrate this nutrition information into your nutritionNotes section. Don't just copy-paste - synthesize it into coaching advice that connects to their training schedule and goals.

`;

  // Sport-Specific Guidance
  const detectedSport = detectSport(questionnaire);
  if (detectedSport) {
    const sportGuidance = getSportGuidance(detectedSport);
    user += `
${sportGuidance}

`;
  }

  user += `
## Training Prescription (MUST FOLLOW)
- Primary goal: ${questionnaire.goals.primaryGoal.replace('_', ' ')}
- Secondary goal: ${questionnaire.goals.secondaryGoal?.replace('_', ' ') || 'None'}
- Timeframe: ${questionnaire.goals.timeframe}
- Specific targets: ${questionnaire.goals.specificTargets.join(', ') || 'None specified'}
- Experience level: ${questionnaire.experience.currentLevel}
- Availability: ${questionnaire.availability.daysPerWeek} days/week, ${questionnaire.availability.sessionDuration} minutes/session
- Time of day: ${questionnaire.availability.timeOfDay}
- Max exercises per session: ${questionnaire.constraints.maxExercisesPerSession || 'No limit (keep ~5 unless specified)'}

## Program Design Blueprint (MUST FOLLOW)
${programDesignToPrompt(programDesign)}

`;

  user += `
## Complete User Profile (Raw Data)

### Goals
- Primary: ${questionnaire.goals.primaryGoal.replace('_', ' ')}
- Secondary: ${questionnaire.goals.secondaryGoal?.replace('_', ' ') || 'None'}
- Timeframe: ${questionnaire.goals.timeframe}
- Specific targets: ${questionnaire.goals.specificTargets.join(', ') || 'None specified'}${
  questionnaire.goals.sportDetails?.sportName
    ? `\n- Sport: ${questionnaire.goals.sportDetails.sportName} (${questionnaire.goals.sportDetails.currentPhase?.replace('-', ' ') || 'no specific phase'})`
    : ''
}

### Experience
- Training years: ${questionnaire.experience.trainingYears}
- Level: ${questionnaire.experience.currentLevel}
- Training consistency: ${questionnaire.experience.trainingConsistency.replace('_', ' ')}
- Current body weight: ${(questionnaire.experience.currentBodyWeight ?? 0) > 0 ? `${questionnaire.experience.currentBodyWeight}kg` : 'Not specified'}
- Current lifts: ${
  questionnaire.experience.currentLifts &&
  ((questionnaire.experience.currentLifts.squat ?? 0) > 0 ||
    (questionnaire.experience.currentLifts.bench ?? 0) > 0 ||
    (questionnaire.experience.currentLifts.deadlift ?? 0) > 0 ||
    (questionnaire.experience.currentLifts.overheadPress ?? 0) > 0)
    ? `Squat: ${(questionnaire.experience.currentLifts.squat ?? 0) > 0 ? questionnaire.experience.currentLifts.squat + 'kg' : 'N/A'}, Bench: ${(questionnaire.experience.currentLifts.bench ?? 0) > 0 ? questionnaire.experience.currentLifts.bench + 'kg' : 'N/A'}, Deadlift: ${(questionnaire.experience.currentLifts.deadlift ?? 0) > 0 ? questionnaire.experience.currentLifts.deadlift + 'kg' : 'N/A'}, OHP: ${(questionnaire.experience.currentLifts.overheadPress ?? 0) > 0 ? questionnaire.experience.currentLifts.overheadPress + 'kg' : 'N/A'}`
    : 'Not specified'
}
- Recent training: ${questionnaire.experience.recentTraining || 'Not specified'}
- Strong points: ${questionnaire.experience.strongPoints.join(', ') || 'Not specified'}
- Weak points: ${questionnaire.experience.weakPoints.join(', ') || 'Not specified'}

### Availability
- Days per week: ${questionnaire.availability.daysPerWeek}
- Session duration: ${questionnaire.availability.sessionDuration} minutes
- Preferred days: ${questionnaire.availability.preferredDays.join(', ') || 'Flexible'}
- Time of day: ${questionnaire.availability.timeOfDay}

### Equipment
- Gym access: ${questionnaire.equipment.gymAccess ? 'Yes' : 'No'}
- Gym type: ${questionnaire.equipment.gymType || 'N/A'}
- Available equipment: ${questionnaire.equipment.availableEquipment.join(', ') || 'Not specified'}
- Limited equipment: ${questionnaire.equipment.limitedEquipment.join(', ') || 'None'}

### Injuries (CRITICAL - MUST RESPECT)
${formatInjuries(questionnaire.injuries)}

### Recovery
- Sleep: ${questionnaire.recovery.sleepHours} hours (${questionnaire.recovery.sleepQuality} quality)
- Stress level: ${questionnaire.recovery.stressLevel.replace('_', ' ')}
- Recovery capacity: ${questionnaire.recovery.recoveryCapacity}

### Nutrition
- Approach: ${questionnaire.nutrition.nutritionApproach}
- Protein intake: ${questionnaire.nutrition.proteinIntake}
- Dietary restrictions: ${questionnaire.nutrition.dietaryRestrictions.join(', ') || 'None'}
- Supplements: ${questionnaire.nutrition.supplementUse.join(', ') || 'None'}
- Favorite foods: ${questionnaire.nutrition.favoriteFoods.join(', ') || 'None specified'}
- Disliked foods: ${questionnaire.nutrition.dislikedFoods.join(', ') || 'None'}

### Additional Constraints
- Time constraints: ${questionnaire.constraints.timeConstraints || 'None'}
- Other notes: ${questionnaire.constraints.otherNotes || 'None'}

---

Using all of the above context, generate a deeply personalized workout plan that demonstrates you understand THIS specific person's situation, constraints, and goals. Make every section feel like coaching advice, not a template.`;

  const trainingKnowledge = getTrainingKnowledge(questionnaire);
  const system = trainingKnowledge
    ? `${SYSTEM_INSTRUCTIONS}\n\n=== TRAINING KNOWLEDGE BASE (SELECTED) ===\n${trainingKnowledge}`
    : SYSTEM_INSTRUCTIONS;

  return {
    system,
    user
  };
}
