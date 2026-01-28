import { QuestionnaireData } from '@/lib/types';

/**
 * Context Enrichment Module
 * Synthesizes questionnaire data into intelligent insights for the AI
 */

export interface RecoveryProfile {
  capacity: 'low' | 'moderate' | 'high';
  volumeModifier: number;
  notes: string;
}

export interface ConstraintAnalysis {
  primary: 'time' | 'equipment' | 'injury' | 'recovery' | 'none';
  impact: string;
}

export interface WeakPointMapping {
  [weakPoint: string]: {
    priority: 'high' | 'medium' | 'low';
    exercises: string[];
  };
}

/**
 * Synthesizes recovery capacity from sleep, stress, and training frequency
 */
export function synthesizeRecoveryProfile(
  recovery: QuestionnaireData['recovery'],
  availability: QuestionnaireData['availability']
): RecoveryProfile {
  const { sleepHours, sleepQuality, stressLevel, recoveryCapacity } = recovery;
  const { daysPerWeek } = availability;

  // Calculate base capacity score (0-10)
  let capacityScore = 5;

  // Sleep hours impact (0-3 points)
  if (sleepHours >= 8) capacityScore += 2;
  else if (sleepHours >= 7) capacityScore += 1;
  else if (sleepHours < 6) capacityScore -= 2;

  // Sleep quality impact (0-2 points)
  if (sleepQuality === 'excellent') capacityScore += 2;
  else if (sleepQuality === 'good') capacityScore += 1;
  else if (sleepQuality === 'poor') capacityScore -= 2;

  // Stress level impact (-3 to +1 points)
  if (stressLevel === 'very_high') capacityScore -= 3;
  else if (stressLevel === 'high') capacityScore -= 2;
  else if (stressLevel === 'moderate') capacityScore -= 1;
  else if (stressLevel === 'low') capacityScore += 1;

  // Self-reported recovery capacity (0-2 points)
  if (recoveryCapacity === 'high') capacityScore += 2;
  else if (recoveryCapacity === 'low') capacityScore -= 2;

  // Training frequency consideration
  const frequencyLoad = daysPerWeek >= 5 ? -1 : 0;
  capacityScore += frequencyLoad;

  // Determine final capacity tier
  let capacity: 'low' | 'moderate' | 'high';
  let volumeModifier: number;

  if (capacityScore <= 4) {
    capacity = 'low';
    volumeModifier = 0.75;
  } else if (capacityScore >= 7) {
    capacity = 'high';
    volumeModifier = 1.2;
  } else {
    capacity = 'moderate';
    volumeModifier = 1.0;
  }

  // Build narrative notes
  const notes = buildRecoveryNotes(
    capacity,
    sleepHours,
    sleepQuality,
    stressLevel,
    recoveryCapacity,
    daysPerWeek
  );

  return { capacity, volumeModifier, notes };
}

function buildRecoveryNotes(
  capacity: 'low' | 'moderate' | 'high',
  sleepHours: number,
  sleepQuality: string,
  stressLevel: string,
  recoveryCapacity: string,
  daysPerWeek: number
): string {
  const factors: string[] = [];

  if (sleepHours < 6) {
    factors.push(`limited sleep (${sleepHours}h)`);
  } else if (sleepHours >= 8) {
    factors.push(`good sleep duration (${sleepHours}h)`);
  }

  if (sleepQuality === 'poor' || sleepQuality === 'fair') {
    factors.push(`${sleepQuality} sleep quality`);
  }

  if (stressLevel === 'high' || stressLevel === 'very_high') {
    factors.push(`${stressLevel.replace('_', ' ')} stress levels`);
  }

  if (daysPerWeek >= 5) {
    factors.push(`high training frequency (${daysPerWeek} days/week)`);
  }

  let description = `${capacity.charAt(0).toUpperCase() + capacity.slice(1)} recovery capacity`;

  if (factors.length > 0) {
    description += ` due to ${factors.join(', ')}`;
  }

  return description + '. Volume should be adjusted accordingly to prevent overtraining.';
}

/**
 * Analyzes constraints to identify the primary limiting factor
 */
export function analyzeConstraints(questionnaire: QuestionnaireData): ConstraintAnalysis {
  const { availability, equipment, injuries, recovery, constraints } = questionnaire;

  // Check for injury constraints
  const hasHighSeverityInjury = injuries.currentInjuries.some(
    (inj) => inj.severity === 'high'
  );
  const hasMediumSeverityInjury = injuries.currentInjuries.some(
    (inj) => inj.severity === 'medium'
  );

  if (hasHighSeverityInjury || injuries.currentInjuries.length >= 2) {
    return {
      primary: 'injury',
      impact: `Current injuries (${injuries.currentInjuries.map((i) => i.area).join(', ')}) require careful exercise selection and progression. Many traditional movements will need modifications or substitutions.`,
    };
  }

  // Check for recovery constraints
  const recoveryProfile = synthesizeRecoveryProfile(recovery, availability);
  if (recoveryProfile.capacity === 'low') {
    return {
      primary: 'recovery',
      impact: `${recoveryProfile.notes} Training volume must be conservative (${(recoveryProfile.volumeModifier * 100).toFixed(0)}% of typical recommendations) to ensure adequate recovery between sessions.`,
    };
  }

  // Check for time constraints
  const hasShortSessions = availability.sessionDuration < 45;
  const hasLimitedDays = availability.daysPerWeek <= 2;
  const hasTimeConstraints = constraints.timeConstraints && constraints.timeConstraints.length > 0;

  if (hasShortSessions || hasLimitedDays || hasTimeConstraints) {
    return {
      primary: 'time',
      impact: `Limited training time (${availability.daysPerWeek} days/week, ${availability.sessionDuration} min/session) requires efficient exercise selection. Focus on compound movements and minimize rest periods where safe.`,
    };
  }

  // Check for equipment constraints
  const hasLimitedEquipment = equipment.limitedEquipment.length > 0 || !equipment.gymAccess;
  const isHomeGym = equipment.gymType === 'home';

  if (hasLimitedEquipment || (isHomeGym && equipment.availableEquipment.length < 5)) {
    return {
      primary: 'equipment',
      impact: equipment.gymAccess
        ? `Home gym setup with limited equipment (${equipment.availableEquipment.join(', ')}) requires creative exercise selection and use of available implements.`
        : 'No gym access means bodyweight-focused or minimal-equipment training. Progress will come from rep progression, tempo manipulation, and movement complexity.',
    };
  }

  // Medium severity injury as secondary constraint
  if (hasMediumSeverityInjury) {
    return {
      primary: 'injury',
      impact: `Medium-severity injury to ${injuries.currentInjuries.find((i) => i.severity === 'medium')?.area} requires some exercise modifications, but most training can proceed with proper load management.`,
    };
  }

  return {
    primary: 'none',
    impact: 'No major constraints identified. Standard programming approaches can be used with full exercise variety.',
  };
}

/**
 * Maps weak points to specific exercise recommendations
 */
export function mapWeakPointsToExercises(
  weakPoints: string[],
  availableEquipment: string[]
): WeakPointMapping {
  const hasBarbell = availableEquipment.some((e) => e.toLowerCase().includes('barbell'));
  const hasDumbbells = availableEquipment.some((e) => e.toLowerCase().includes('dumbbell'));
  const hasCables = availableEquipment.some((e) => e.toLowerCase().includes('cable'));
  const hasPullUpBar = availableEquipment.some((e) =>
    e.toLowerCase().includes('pull') || e.toLowerCase().includes('bar')
  );

  const mapping: WeakPointMapping = {};

  weakPoints.forEach((weakPoint) => {
    const point = weakPoint.toLowerCase();

    // Back
    if (point.includes('back') || point.includes('pull')) {
      const exercises: string[] = [];
      if (hasPullUpBar) exercises.push('pull-ups', 'chin-ups');
      if (hasBarbell) exercises.push('barbell rows', 'deadlifts');
      if (hasDumbbells) exercises.push('dumbbell rows', 'seal rows');
      if (hasCables) exercises.push('seated cable rows', 'lat pulldowns');
      if (exercises.length === 0) exercises.push('inverted rows', 'bodyweight pull variations');

      mapping[weakPoint] = {
        priority: 'high',
        exercises: exercises.slice(0, 3),
      };
    }

    // Chest
    else if (point.includes('chest') || point.includes('pec')) {
      const exercises: string[] = [];
      if (hasBarbell) exercises.push('bench press', 'incline bench press');
      if (hasDumbbells) exercises.push('dumbbell press', 'dumbbell flyes');
      if (hasCables) exercises.push('cable flyes', 'cable press');
      if (exercises.length === 0) exercises.push('push-ups', 'decline push-ups');

      mapping[weakPoint] = {
        priority: 'high',
        exercises: exercises.slice(0, 3),
      };
    }

    // Legs / Lower body
    else if (point.includes('leg') || point.includes('quad') || point.includes('glute') || point.includes('posterior')) {
      const exercises: string[] = [];
      if (hasBarbell) exercises.push('squats', 'Romanian deadlifts', 'lunges');
      if (hasDumbbells) exercises.push('goblet squats', 'Bulgarian split squats', 'dumbbell RDLs');
      if (exercises.length === 0) exercises.push('split squats', 'single-leg deadlifts', 'step-ups');

      mapping[weakPoint] = {
        priority: 'high',
        exercises: exercises.slice(0, 3),
      };
    }

    // Shoulders
    else if (point.includes('shoulder') || point.includes('delt')) {
      const exercises: string[] = [];
      if (hasBarbell) exercises.push('overhead press', 'push press');
      if (hasDumbbells) exercises.push('dumbbell shoulder press', 'lateral raises', 'front raises');
      if (hasCables) exercises.push('cable lateral raises', 'face pulls');
      if (exercises.length === 0) exercises.push('pike push-ups', 'handstand push-up progressions');

      mapping[weakPoint] = {
        priority: 'medium',
        exercises: exercises.slice(0, 3),
      };
    }

    // Arms
    else if (point.includes('arm') || point.includes('bicep') || point.includes('tricep')) {
      const exercises: string[] = [];
      if (hasDumbbells) exercises.push('dumbbell curls', 'hammer curls', 'overhead extensions');
      if (hasCables) exercises.push('cable curls', 'tricep pushdowns');
      if (hasBarbell) exercises.push('barbell curls', 'close-grip bench press');
      if (exercises.length === 0) exercises.push('chin-ups (biceps)', 'diamond push-ups (triceps)');

      mapping[weakPoint] = {
        priority: 'low',
        exercises: exercises.slice(0, 3),
      };
    }

    // Core / Abs
    else if (point.includes('core') || point.includes('ab')) {
      mapping[weakPoint] = {
        priority: 'medium',
        exercises: ['planks', 'dead bugs', 'pallof press', 'ab wheel rollouts'],
      };
    }

    // Generic catch-all
    else {
      mapping[weakPoint] = {
        priority: 'medium',
        exercises: ['Compound movements targeting this area'],
      };
    }
  });

  return mapping;
}

/**
 * Creates a coaching narrative summarizing the user's situation
 */
export function createTrainingNarrative(questionnaire: QuestionnaireData): string {
  const { goals, experience, availability, equipment, injuries, recovery } = questionnaire;

  const sentences: string[] = [];

  // Opening: experience context
  if (experience.trainingYears === 0) {
    sentences.push(
      `As a beginner to structured training, you're in an excellent position to make rapid progress with the right foundation.`
    );
  } else if (experience.trainingYears < 2) {
    sentences.push(
      `After ${experience.trainingYears} ${experience.trainingYears === 1 ? 'year' : 'years'} of training, you've built initial momentum and are ready for more structured programming.`
    );
  } else if (experience.trainingYears < 5) {
    sentences.push(
      `With ${experience.trainingYears} years of training experience at the ${experience.currentLevel} level, you've developed a solid foundation and are ready for intelligent progression.`
    );
  } else {
    sentences.push(
      `Your ${experience.trainingYears} years of training at the ${experience.currentLevel} level means you require sophisticated programming to continue progressing.`
    );
  }

  // Goal context
  const goalText = goals.primaryGoal.replace('_', ' ');
  const timeframeText = goals.timeframe.toLowerCase();
  if (goals.secondaryGoal) {
    const secondaryText = goals.secondaryGoal.replace('_', ' ');
    sentences.push(
      `Your primary goal of ${goalText} combined with ${secondaryText} over ${timeframeText} requires balanced programming.`
    );
  } else {
    sentences.push(
      `Your ${goalText} goal over ${timeframeText} provides clear direction for your training approach.`
    );
  }

  // Constraint acknowledgment
  const constraints = analyzeConstraints(questionnaire);
  if (constraints.primary !== 'none') {
    sentences.push(constraints.impact);
  }

  // Recovery context
  const recoveryProfile = synthesizeRecoveryProfile(recovery, availability);
  if (recoveryProfile.capacity === 'low' || recoveryProfile.capacity === 'high') {
    const adj = recoveryProfile.capacity === 'low' ? 'limited' : 'excellent';
    sentences.push(
      `Your ${adj} recovery capacity (${recovery.sleepHours}h sleep, ${recovery.stressLevel.replace('_', ' ')} stress) will inform volume and frequency decisions.`
    );
  }

  // Equipment/schedule context
  if (availability.daysPerWeek <= 3) {
    sentences.push(
      `Training ${availability.daysPerWeek} days per week in ${availability.sessionDuration}-minute sessions requires efficient, full-body or upper/lower approaches.`
    );
  } else if (availability.daysPerWeek >= 5) {
    sentences.push(
      `Your ${availability.daysPerWeek}-day training schedule allows for higher frequency splits that can distribute volume effectively.`
    );
  }

  return sentences.join(' ');
}

/**
 * Calculates maximum weekly sets based on recovery profile and experience
 */
export function calculateMaxSetsPerWeek(
  recoveryProfile: RecoveryProfile,
  experienceLevel: string
): number {
  let baseSets: number;

  // Base sets by experience
  if (experienceLevel === 'beginner') {
    baseSets = 10;
  } else if (experienceLevel === 'intermediate') {
    baseSets = 14;
  } else {
    baseSets = 20;
  }

  // Apply recovery modifier
  const adjustedSets = Math.round(baseSets * recoveryProfile.volumeModifier);

  return adjustedSets;
}
