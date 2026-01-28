import { QuestionnaireData } from '@/lib/types';

/**
 * Nutrition Integration Module
 * Provides training-integrated nutrition strategies
 */

export interface NutritionStrategy {
  trainingDayCalories: string;
  restDayCalories: string;
  proteinTarget: string;
  carbTarget: string;
  fatTarget: string;
  notes: string;
}

/**
 * Generate day-by-day nutrition strategy based on goals and training schedule
 */
export function generateNutritionStrategy(
  goal: string,
  nutritionApproach: string,
  proteinIntake: string,
  trainingDays: number,
  bodyWeight?: number
): NutritionStrategy {
  const restDays = 7 - trainingDays;

  // Protein targets based on intake level
  const proteinTargets: Record<string, string> = {
    low: '1.2-1.6g/kg bodyweight',
    moderate: '1.6-2.0g/kg bodyweight',
    high: '2.0-2.4g/kg bodyweight',
    very_high: '2.4-3.0g/kg bodyweight',
  };

  let proteinTarget = proteinTargets[proteinIntake] || '1.8-2.2g/kg bodyweight';

  // If body weight is provided, calculate specific protein amounts
  if (bodyWeight) {
    const multipliers: Record<string, { low: number; high: number }> = {
      low: { low: 1.2, high: 1.6 },
      moderate: { low: 1.6, high: 2.0 },
      high: { low: 2.0, high: 2.4 },
      very_high: { low: 2.4, high: 3.0 },
    };

    const range = multipliers[proteinIntake] || { low: 1.8, high: 2.2 };
    const lowAmount = Math.round(bodyWeight * range.low);
    const highAmount = Math.round(bodyWeight * range.high);
    proteinTarget = `${lowAmount}-${highAmount}g/day (${range.low}-${range.high}g/kg at ${bodyWeight}kg)`;
  }

  // Goal-specific strategies
  if (goal === 'muscle_building') {
    if (nutritionApproach === 'surplus') {
      return {
        trainingDayCalories: 'Maintenance + 300-400 calories',
        restDayCalories: 'Maintenance + 100-200 calories',
        proteinTarget,
        carbTarget: 'Training: 3-5g/kg | Rest: 2-3g/kg',
        fatTarget: '0.8-1.2g/kg bodyweight',
        notes: `Lean bulk approach: Concentrate surplus on training days when protein synthesis is elevated. ${trainingDays} training days and ${restDays} rest days per week. Time majority of carbs around workouts (40-60g pre-workout, 60-80g post-workout).`,
      };
    } else if (nutritionApproach === 'maintenance') {
      return {
        trainingDayCalories: 'Maintenance + 100-200 calories',
        restDayCalories: 'Maintenance - 100 calories',
        proteinTarget,
        carbTarget: 'Training: 3-4g/kg | Rest: 2g/kg',
        fatTarget: '0.8-1.0g/kg bodyweight',
        notes: `Recomposition approach: Slight surplus on training days, deficit on rest. Progress will be slower but body composition improves. ${trainingDays} training days for muscle building, ${restDays} rest days for fat utilization.`,
      };
    }
  }

  if (goal === 'strength') {
    return {
      trainingDayCalories:
        nutritionApproach === 'surplus'
          ? 'Maintenance + 200-300 calories'
          : 'Maintenance',
      restDayCalories:
        nutritionApproach === 'surplus'
          ? 'Maintenance + 100 calories'
          : 'Maintenance',
      proteinTarget,
      carbTarget: 'Training: 3-5g/kg | Rest: 2-3g/kg',
      fatTarget: '1.0-1.5g/kg bodyweight',
      notes: `Strength gains require adequate fuel. Prioritize carbs 2-3 hours pre-workout for glycogen stores. ${trainingDays} heavy training days need full energy support. Don't cut calories aggressively if strength is the goal.`,
    };
  }

  if (goal === 'fat_loss') {
    return {
      trainingDayCalories: 'Maintenance - 300 calories',
      restDayCalories: 'Maintenance - 500 calories',
      proteinTarget: proteinIntake === 'low' ? '2.0-2.4g/kg' : proteinTarget, // Boost protein in deficit
      carbTarget: 'Training: 2-3g/kg | Rest: 1-2g/kg',
      fatTarget: '0.6-1.0g/kg bodyweight',
      notes: `Fat loss protocol: Larger deficit on ${restDays} rest days, smaller deficit on ${trainingDays} training days to preserve performance. High protein (${proteinIntake === 'low' ? '2.0-2.4g/kg minimum' : proteinTarget}) protects muscle. Time 40-50g carbs pre-workout for training quality.`,
    };
  }

  if (goal === 'endurance') {
    return {
      trainingDayCalories: 'Maintenance + 200-400 calories (depending on session length)',
      restDayCalories: 'Maintenance',
      proteinTarget: '1.4-1.8g/kg bodyweight',
      carbTarget: 'Training: 4-7g/kg | Rest: 3-4g/kg',
      fatTarget: '0.8-1.2g/kg bodyweight',
      notes: `Endurance requires higher carb intake for glycogen replenishment. ${trainingDays} training days need substantial carbs (4-7g/kg). Focus on carbs before/during/after longer sessions. Protein needs are moderate but consistent.`,
    };
  }

  if (goal === 'sport_specific') {
    return {
      trainingDayCalories:
        nutritionApproach === 'surplus'
          ? 'Maintenance + 200-400 calories'
          : 'Maintenance',
      restDayCalories: 'Maintenance',
      proteinTarget,
      carbTarget: 'Training: 3-5g/kg | Rest: 2-3g/kg',
      fatTarget: '1.0-1.5g/kg bodyweight',
      notes: `Athletic performance nutrition: Fuel training days adequately (${trainingDays} days/week). Carbs support power output and recovery. Adjust based on sport demands - explosive sports need more carbs, skill-based may need less. Don't chronically under-eat.`,
    };
  }

  // Default: general_fitness
  return {
    trainingDayCalories: 'Maintenance',
    restDayCalories: 'Maintenance',
    proteinTarget,
    carbTarget: '2-4g/kg bodyweight',
    fatTarget: '0.8-1.2g/kg bodyweight',
    notes: `Balanced approach for general fitness. ${trainingDays} training days and ${restDays} rest days. Maintain consistent intake, prioritize whole foods, and ensure adequate protein (${proteinTarget}) for recovery.`,
  };
}

/**
 * Recommend supplements based on user's current usage, goals, and dietary restrictions
 */
export function recommendSupplements(
  goals: QuestionnaireData['goals'],
  supplementUse: string[],
  dietaryRestrictions: string[],
  trainingIntensity: 'low' | 'moderate' | 'high'
): string {
  const currentSupps = supplementUse.map((s) => s.toLowerCase());
  const restrictions = dietaryRestrictions.map((r) => r.toLowerCase());

  const recommendations: string[] = [];
  const alreadyUsing: string[] = [];

  // Check what they're already using
  const hasCreatine = currentSupps.some((s) => s.includes('creatine'));
  const hasProtein = currentSupps.some((s) => s.includes('protein') || s.includes('whey'));
  const hasCaffeine = currentSupps.some((s) => s.includes('caffeine') || s.includes('pre-workout'));
  const hasVitaminD = currentSupps.some((s) => s.includes('vitamin d'));
  const hasMagnesium = currentSupps.some((s) => s.includes('magnesium'));
  const hasOmega3 = currentSupps.some((s) => s.includes('omega') || s.includes('fish oil'));

  // Build "already using" acknowledgment
  if (supplementUse.length > 0) {
    alreadyUsing.push(`You're already using: ${supplementUse.join(', ')}.`);
  }

  // Creatine - for strength and muscle building
  if (!hasCreatine && (goals.primaryGoal === 'muscle_building' || goals.primaryGoal === 'strength')) {
    recommendations.push(
      '**Creatine monohydrate** (5g/day): Most researched supplement for strength and muscle gains, very cost-effective'
    );
  }

  // Protein powder - if not already using and intensity is moderate-high
  const isVegan = restrictions.some((r) => r.includes('vegan') || r.includes('plant'));
  if (!hasProtein && trainingIntensity !== 'low') {
    if (isVegan) {
      recommendations.push(
        '**Plant-based protein powder** (1-2 servings/day): Helps meet higher protein needs on a vegan diet, especially post-workout'
      );
    } else {
      recommendations.push(
        '**Whey protein** (1-2 servings/day): Convenient way to hit protein targets, especially post-workout'
      );
    }
  }

  // Caffeine - if high intensity training and not already using
  if (!hasCaffeine && trainingIntensity === 'high') {
    recommendations.push(
      '**Caffeine** (200-400mg pre-workout): Improves focus and performance, but cycle off every 4-6 weeks to prevent tolerance'
    );
  }

  // Vitamin D - general recommendation if not using
  if (!hasVitaminD) {
    recommendations.push(
      '**Vitamin D3** (2000-4000 IU/day): Most people are deficient, supports bone health, immune function, and recovery'
    );
  }

  // Magnesium - for recovery and sleep
  if (!hasMagnesium && trainingIntensity === 'high') {
    recommendations.push(
      '**Magnesium glycinate** (300-400mg before bed): Supports recovery, sleep quality, and reduces muscle cramps'
    );
  }

  // Omega-3 - for general health and inflammation
  if (!hasOmega3) {
    if (isVegan) {
      recommendations.push(
        '**Algae-based omega-3** (1-2g EPA+DHA/day): Supports joint health and reduces inflammation from training'
      );
    } else {
      recommendations.push(
        '**Fish oil** (2-3g EPA+DHA/day): Reduces inflammation, supports joint health and cardiovascular function'
      );
    }
  }

  // Fat loss specific
  if (goals.primaryGoal === 'fat_loss') {
    recommendations.push(
      '**Note:** No fat-burning supplements are necessary. Calorie deficit is what matters. Caffeine can help with energy during a cut.'
    );
  }

  // Build final output
  let output = '';

  if (alreadyUsing.length > 0) {
    output += alreadyUsing.join(' ') + '\n\n';
  }

  if (recommendations.length > 0) {
    output += '**Additional evidence-based recommendations:**\n';
    output += recommendations.map((r) => `- ${r}`).join('\n');
  } else {
    output += 'Your current supplement stack covers the essentials well.';
  }

  return output.trim();
}

/**
 * Create meal timing guidance based on training schedule
 */
export function createMealTimingGuidance(
  timeOfDay: string,
  sessionDuration: number,
  goal: string
): string {
  const guidance: string[] = [];

  // Pre-workout timing
  if (timeOfDay === 'morning') {
    if (goal === 'fat_loss') {
      guidance.push(
        '**Morning training (fasted or fed):** Can train fasted if session <60 min, but performance may suffer. If fueling, have 20-40g carbs + 15-20g protein 30-60 min before (e.g., banana + protein shake).'
      );
    } else {
      guidance.push(
        '**Morning training:** Have 30-50g carbs + 15-25g protein 45-90 min before training (e.g., oatmeal + protein shake, toast + eggs). Critical for performance when training early.'
      );
    }
  } else if (timeOfDay === 'afternoon' || timeOfDay === 'evening') {
    guidance.push(
      `**${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} training:** Ensure you've had 2-3 meals before training. Last meal 2-3 hours pre-workout with carbs + protein (e.g., rice + chicken, pasta + lean meat). Small carb snack (20-30g) 30-60 min before if needed.`
    );
  } else {
    // flexible
    guidance.push(
      '**Flexible training time:** Whenever you train, aim for 30-50g carbs + 15-25g protein 1-2 hours before. Adjust based on digestion - some prefer longer gaps, others train 30 min after eating.'
    );
  }

  // Post-workout timing
  const postWorkoutWindow = sessionDuration >= 75 ? '30-60 minutes' : '60-90 minutes';
  if (goal === 'muscle_building' || goal === 'strength') {
    guidance.push(
      `**Post-workout (within ${postWorkoutWindow}):** 40-60g carbs + 25-40g protein. This is your most anabolic window. Examples: protein shake + banana + rice cakes, chicken + rice + fruit.`
    );
  } else if (goal === 'fat_loss') {
    guidance.push(
      `**Post-workout (within ${postWorkoutWindow}):** 20-30g carbs + 30-40g protein. Prioritize protein to preserve muscle. Carbs aid recovery but keep moderate in a deficit.`
    );
  } else {
    guidance.push(
      `**Post-workout (within ${postWorkoutWindow}):** 30-50g carbs + 25-35g protein for recovery. Not as critical as once thought, but aids glycogen replenishment and protein synthesis.`
    );
  }

  // Evening/bedtime
  if (timeOfDay === 'evening' || timeOfDay === 'flexible') {
    guidance.push(
      '**Before bed:** 20-40g slow-digesting protein (casein shake, Greek yogurt, cottage cheese) supports overnight muscle protein synthesis. Include if daily protein target not yet met.'
    );
  }

  // General meal frequency
  guidance.push(
    `**Meal frequency:** Aim for 3-5 meals spread throughout the day. More frequent meals (4-5) may help with adherence and energy levels. Minimum 3 meals with protein at each (25-40g per meal).`
  );

  return guidance.join('\n\n');
}

/**
 * Estimate training intensity based on questionnaire
 */
export function estimateTrainingIntensity(questionnaire: QuestionnaireData): 'low' | 'moderate' | 'high' {
  const { daysPerWeek, sessionDuration } = questionnaire.availability;
  const { currentLevel } = questionnaire.experience;
  const { primaryGoal } = questionnaire.goals;

  // Calculate weekly volume
  const weeklyMinutes = daysPerWeek * sessionDuration;

  // Base intensity on volume and experience
  if (currentLevel === 'advanced' || weeklyMinutes >= 300 || daysPerWeek >= 5) {
    return 'high';
  } else if (currentLevel === 'intermediate' || weeklyMinutes >= 180 || daysPerWeek >= 3) {
    return 'moderate';
  } else {
    return 'low';
  }
}
