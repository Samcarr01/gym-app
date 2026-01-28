import { QuestionnaireData } from '@/lib/types';

/**
 * Sport-Specific Intelligence Module
 * Provides sport-relevant training guidance
 */

export interface SportDemands {
  primaryMovements: string[];
  keyMuscles: string[];
  recommendedExercises: string[];
  energySystems: string[];
  injuryRisks: string[];
  periodizationNotes: string;
}

const SPORT_DEMANDS: Record<string, SportDemands> = {
  basketball: {
    primaryMovements: ['vertical jump', 'lateral agility', 'sprint', 'deceleration'],
    keyMuscles: ['quads', 'glutes', 'calves', 'core', 'hip flexors'],
    recommendedExercises: [
      'box jumps',
      'depth jumps',
      'lateral bounds',
      'Bulgarian split squats',
      'Romanian deadlifts',
      'single-leg squats',
      'calf raises',
      'Nordic curls (hamstring strength)',
    ],
    energySystems: ['anaerobic alactic (10-15s bursts)', 'aerobic base for recovery between plays'],
    injuryRisks: ['ankle sprains', 'knee (ACL)', 'lower back', 'Achilles tendon'],
    periodizationNotes:
      'In-season: 2x/week maintenance strength, emphasize power. Off-season: build strength base (8-12 weeks), then convert to power (4-6 weeks). Include single-leg stability work year-round.',
  },
  football: {
    primaryMovements: ['sprint', 'explosive acceleration', 'cutting', 'contact/collision resistance'],
    keyMuscles: ['quads', 'glutes', 'hamstrings', 'core', 'posterior chain', 'upper back', 'shoulders'],
    recommendedExercises: [
      'squats (back/front)',
      'deadlifts',
      'power cleans',
      'sled pushes/pulls',
      'box jumps',
      'Nordic curls',
      'bench press',
      'rows',
      'farmer carries',
    ],
    energySystems: ['anaerobic alactic (short bursts)', 'anaerobic lactic (sustained drives)', 'aerobic base'],
    injuryRisks: ['hamstring strains', 'groin pulls', 'shoulder', 'knee', 'concussion'],
    periodizationNotes:
      'Off-season: hypertrophy + max strength focus. Pre-season: power conversion. In-season: 1-2x/week to maintain. Emphasize posterior chain (hamstrings) for injury prevention.',
  },
  soccer: {
    primaryMovements: ['repeated sprints', 'agility/cutting', 'endurance running', 'kicking'],
    keyMuscles: ['quads', 'hamstrings', 'hip flexors', 'adductors', 'core', 'calves'],
    recommendedExercises: [
      'squats',
      'Romanian deadlifts',
      'Copenhagen planks (adductors)',
      'Nordic curls',
      'single-leg RDLs',
      'lateral lunges',
      'sled drags',
    ],
    energySystems: ['aerobic base (extensive)', 'repeated sprint ability', 'anaerobic capacity'],
    injuryRisks: ['hamstring strains', 'groin/adductor injuries', 'ankle sprains', 'ACL'],
    periodizationNotes:
      'Off-season: strength foundation (lower volume due to running volume). In-season: 1x/week maintenance, focus on injury prevention (hamstrings, adductors). Heavy conditioning load from sport.',
  },
  running: {
    primaryMovements: ['sustained aerobic running', 'running economy', 'ground contact force'],
    keyMuscles: ['glutes', 'hamstrings', 'calves', 'core', 'hip stabilizers'],
    recommendedExercises: [
      'Romanian deadlifts',
      'single-leg deadlifts',
      'calf raises',
      'Nordic curls',
      'glute bridges',
      'side planks',
      'clamshells',
      'dead bugs',
    ],
    energySystems: ['aerobic (primary)', 'anaerobic threshold for speed work'],
    injuryRisks: ["runner's knee", 'IT band syndrome', 'Achilles tendinitis', 'plantar fasciitis', 'stress fractures'],
    periodizationNotes:
      'Strength 2x/week year-round to prevent injury and improve running economy. Focus on posterior chain, single-leg stability, and core. Low volume (2-3 sets), high quality. Avoid high-volume lower body work during peak mileage weeks.',
  },
  powerlifting: {
    primaryMovements: ['squat', 'bench press', 'deadlift', 'maximal force production'],
    keyMuscles: ['full body - quads', 'glutes', 'hamstrings', 'back', 'chest', 'core'],
    recommendedExercises: [
      'competition squat',
      'competition bench',
      'competition deadlift',
      'pause variations',
      'tempo work',
      'close-grip bench',
      'Romanian deadlifts',
      'rows',
      'overhead press',
    ],
    energySystems: ['phosphagen system (1-5 rep max strength)'],
    injuryRisks: ['lower back', 'shoulder impingement', 'elbow tendinitis', 'knee'],
    periodizationNotes:
      'Block periodization essential: Hypertrophy block (8-12 weeks, 6-10 reps) → Strength block (6-8 weeks, 3-5 reps) → Peaking block (3-4 weeks, 1-3 reps) → Competition/test → Deload. Manage fatigue carefully with RPE and velocity tracking.',
  },
  weightlifting: {
    primaryMovements: ['snatch', 'clean & jerk', 'explosive triple extension', 'overhead stability'],
    keyMuscles: ['full body - posterior chain', 'quads', 'core', 'shoulders', 'upper back'],
    recommendedExercises: [
      'snatch (full, power, hang)',
      'clean & jerk (full, power, variations)',
      'front squats',
      'back squats',
      'Romanian deadlifts',
      'overhead squats',
      'push press',
      'pulls (snatch/clean)',
    ],
    energySystems: ['phosphagen system (power/speed)'],
    injuryRisks: ['shoulder', 'wrist', 'lower back', 'knee'],
    periodizationNotes:
      'High frequency (4-6 days/week) with daily technique work. Block periodization: GPP → Accumulation (volume) → Intensification (load) → Competition. Emphasize position work and mobility throughout.',
  },
  crossfit: {
    primaryMovements: ['olympic lifts', 'gymnastics', 'metabolic conditioning', 'mixed modal'],
    keyMuscles: ['full body - generalist approach'],
    recommendedExercises: [
      'olympic lift variations',
      'squats (all types)',
      'deadlifts',
      'strict pull-ups/dips',
      'overhead press',
      'muscle-ups',
      'handstand push-ups',
      'core work',
    ],
    energySystems: ['all systems - phosphagen', 'glycolytic', 'oxidative'],
    injuryRisks: ['shoulder', 'lower back', 'wrist', 'knee (high volume)'],
    periodizationNotes:
      'Balance strength work (3 days) with conditioning (3 days). Avoid crushing yourself daily. Periodize: Strength phase (8 weeks) → Mixed phase (4 weeks) → Conditioning emphasis (4 weeks). Manage volume carefully to prevent overtraining.',
  },
  mma: {
    primaryMovements: ['striking power', 'grappling strength', 'explosive bursts', 'sustained effort'],
    keyMuscles: ['posterior chain', 'core (rotational)', 'hips', 'shoulders', 'grip', 'neck'],
    recommendedExercises: [
      'deadlifts',
      'squats',
      'power cleans',
      'medicine ball throws',
      'rows',
      'pull-ups',
      'farmer carries',
      'Turkish get-ups',
      'neck training',
      'grip work',
    ],
    energySystems: ['all systems - fight conditioning critical'],
    injuryRisks: ['shoulder', 'knee', 'ribs', 'hands/wrists', 'neck'],
    periodizationNotes:
      'Off-camp: build strength (4-6 weeks). Fight camp: maintenance strength 2x/week, emphasize power and conditioning. Avoid high-volume strength work during heavy sparring weeks. Include neck and grip training year-round.',
  },
  cycling: {
    primaryMovements: ['sustained pedaling', 'climbing power', 'sprint power'],
    keyMuscles: ['quads', 'glutes', 'hamstrings', 'core', 'hip flexors'],
    recommendedExercises: [
      'squats',
      'Romanian deadlifts',
      'Bulgarian split squats',
      'single-leg press',
      'core stability work',
      'hip flexor strengthening',
    ],
    energySystems: ['aerobic (dominant)', 'anaerobic threshold', 'anaerobic capacity for sprints'],
    injuryRisks: ['lower back', 'knee', 'IT band syndrome', 'neck strain'],
    periodizationNotes:
      'Off-season: 2-3x/week strength to build power. In-season: 1x/week maintenance. Low volume (2-3 sets) to avoid interfering with cycling volume. Focus on single-leg strength and core stability.',
  },
  swimming: {
    primaryMovements: ['pulling power', 'core rotation', 'kick propulsion', 'starts/turns'],
    keyMuscles: ['lats', 'shoulders', 'core', 'glutes', 'hip flexors'],
    recommendedExercises: [
      'lat pulldowns',
      'rows',
      'overhead press',
      'face pulls',
      'deadlifts',
      'squats',
      'core anti-rotation work',
      'medicine ball throws',
    ],
    energySystems: ['varies by event - sprint (anaerobic) to distance (aerobic)'],
    injuryRisks: ['shoulder impingement', 'lower back', 'knee (breaststroke)'],
    periodizationNotes:
      'Off-season: 3x/week strength. In-season: 2x/week maintenance. Emphasize shoulder health (external rotation, scapular stability) and posterior chain. Keep volume moderate to avoid interfering with pool volume.',
  },
  tennis: {
    primaryMovements: ['lateral agility', 'rotational power', 'repeated acceleration/deceleration', 'overhead movements'],
    keyMuscles: ['glutes', 'core (rotational)', 'shoulders', 'forearms', 'calves', 'hip abductors'],
    recommendedExercises: [
      'squats',
      'Romanian deadlifts',
      'lateral lunges',
      'medicine ball throws (rotational)',
      'rows',
      'face pulls',
      'shoulder stability work',
      'single-leg balance',
    ],
    energySystems: ['anaerobic alactic (points)', 'aerobic base for match endurance'],
    injuryRisks: ['shoulder', 'tennis elbow', 'lower back', 'ankle sprains', 'knee'],
    periodizationNotes:
      'Off-season: build strength base. In-season: 2x/week maintenance, emphasize shoulder health and core rotational power. Include single-leg stability work for cutting. Avoid high-volume overhead pressing if playing frequently.',
  },
  volleyball: {
    primaryMovements: ['vertical jump', 'lateral movement', 'overhead movements', 'repeated explosiveness'],
    keyMuscles: ['quads', 'glutes', 'calves', 'shoulders', 'core', 'upper back'],
    recommendedExercises: [
      'squats',
      'Romanian deadlifts',
      'box jumps',
      'depth jumps',
      'calf raises',
      'overhead press',
      'rows',
      'face pulls',
      'rotator cuff work',
    ],
    energySystems: ['anaerobic alactic (jumps/spikes)', 'aerobic base for match duration'],
    injuryRisks: ['ankle sprains', 'knee (patellar tendinitis)', 'shoulder', 'finger injuries'],
    periodizationNotes:
      'Off-season: strength + plyometric development. In-season: 2x/week maintenance with jump volume reduced. Emphasize landing mechanics, shoulder health, and single-leg strength. Monitor jump volume across training and competition.',
  },
};

const SPORT_KEYWORDS = [
  'basketball',
  'football',
  'soccer',
  'running',
  'powerlifting',
  'weightlifting',
  'crossfit',
  'mma',
  'martial arts',
  'boxing',
  'muay thai',
  'jiu jitsu',
  'cycling',
  'swimming',
  'tennis',
  'volleyball',
  'hockey',
  'baseball',
  'track',
  'sprinting',
  'wrestling',
];

/**
 * Detect if user has sport-specific goals
 */
export function detectSport(questionnaire: QuestionnaireData): string | null {
  // Check primary/secondary goals
  if (
    questionnaire.goals.primaryGoal === 'sport_specific' ||
    questionnaire.goals.secondaryGoal === 'sport_specific'
  ) {
    // Look for specific sport mentions
    const signalText = [
      ...questionnaire.goals.specificTargets,
      questionnaire.experience.recentTraining,
      ...questionnaire.experience.strongPoints,
      ...questionnaire.experience.weakPoints,
      questionnaire.constraints.otherNotes,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    // Check for sport keywords
    for (const keyword of SPORT_KEYWORDS) {
      if (signalText.includes(keyword)) {
        // Map to canonical sport name
        if (keyword.includes('martial') || keyword.includes('mma') || keyword.includes('boxing') || keyword.includes('muay') || keyword.includes('jiu')) {
          return 'mma';
        }
        if (keyword.includes('track') || keyword.includes('sprint')) {
          return 'running';
        }
        // Return exact match if it exists in SPORT_DEMANDS
        if (SPORT_DEMANDS[keyword]) {
          return keyword;
        }
      }
    }

    // If sport_specific but no match, return generic signal
    return 'general_athletic';
  }

  return null;
}

/**
 * Get sport-specific programming guidance
 */
export function getSportGuidance(sport: string): string {
  const demands = SPORT_DEMANDS[sport];

  if (!demands) {
    return `
### Sport-Specific Considerations: Athletic Performance

**General Athletic Development:**
Since a specific sport wasn't identified, focus on:
- Building a well-rounded strength base (squat, hinge, push, pull)
- Developing power through olympic lift variations or plyometrics
- Maintaining mobility and movement quality
- Including conditioning appropriate to sport demands
- Periodizing: Strength phase → Power phase → Sport-specific preparation

**Key Principles:**
- Strength work should complement sport training, not replace it
- Manage volume carefully to avoid overtraining
- Prioritize recovery and injury prevention
- Include movement patterns and energy systems relevant to the sport
`;
  }

  return `
### Sport-Specific Considerations: ${sport.charAt(0).toUpperCase() + sport.slice(1)}

**Primary Movement Demands:**
${demands.primaryMovements.map((m) => `- ${m}`).join('\n')}

**Key Muscle Groups:**
${demands.keyMuscles.map((m) => `- ${m}`).join('\n')}

**Recommended Exercises (prioritize these):**
${demands.recommendedExercises.map((e) => `- ${e}`).join('\n')}

**Energy Systems:**
${demands.energySystems.map((e) => `- ${e}`).join('\n')}

**Common Injury Risk Areas (include prehab work):**
${demands.injuryRisks.map((i) => `- ${i} - include preventative exercises`).join('\n')}

**Periodization & Programming Notes:**
${demands.periodizationNotes}

**IMPORTANT:** Your programming should directly support ${sport} performance. Include power/explosive work, address the key muscle groups listed above, and structure training around their competitive season if applicable.
`;
}

/**
 * Get sport-specific exercise priorities for plan normalization
 */
export function getSportExercisePriorities(sport: string): string[] {
  const demands = SPORT_DEMANDS[sport];
  if (!demands) {
    return ['squat', 'deadlift', 'press', 'pull', 'jump', 'sprint'];
  }
  return demands.recommendedExercises;
}
