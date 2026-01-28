import { z } from 'zod';

// ============================================
// QUESTIONNAIRE SCHEMAS
// ============================================

// Goals Section
export const GoalsSectionSchema = z.object({
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
  ]).nullable().optional(),
  timeframe: z.string().min(1, 'Please select a timeframe'),
  specificTargets: z.array(z.string()).default([]),
  sportDetails: z.object({
    sportName: z.string().default(''),
    currentPhase: z.enum(['off-season', 'pre-season', 'in-season', 'post-season', 'not-applicable']).optional()
  }).optional()
});

// Experience Section
export const ExperienceSectionSchema = z.object({
  trainingYears: z.number().min(0).max(30),
  currentLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  recentTraining: z.string().default(''),
  strongPoints: z.array(z.string()).default([]),
  weakPoints: z.array(z.string()).default([]),
  trainingConsistency: z.enum([
    'very_consistent', // Rarely miss sessions
    'mostly_consistent', // Occasional breaks
    'inconsistent', // Frequent breaks
    'returning' // Long break, rebuilding
  ]).default('mostly_consistent'),
  currentBodyWeight: z.number().min(30).max(300).nullable().optional(), // kg
  currentLifts: z.object({
    squat: z.number().nullable().optional(),
    bench: z.number().nullable().optional(),
    deadlift: z.number().nullable().optional(),
    overheadPress: z.number().nullable().optional()
  }).optional()
});

// Availability Section
export const AvailabilitySectionSchema = z.object({
  daysPerWeek: z.number().min(1).max(7),
  sessionDuration: z.number().min(30).max(180),
  preferredDays: z.array(z.string()).default([]),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'flexible'])
});

// Equipment Section
export const EquipmentSectionSchema = z.object({
  gymAccess: z.boolean(),
  gymType: z.enum(['commercial', 'home', 'hotel', 'outdoor']).nullable().optional(),
  availableEquipment: z.array(z.string()).default([]),
  limitedEquipment: z.array(z.string()).default([])
});

// Injury Record
export const InjuryRecordSchema = z.object({
  area: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high']),
  status: z.enum([
    'acute', // Recent, still painful
    'chronic', // Long-term management
    'healing', // Recovering, some restrictions
    'history' // Past injury, being cautious
  ]).default('chronic'),
  notes: z.string().default('')
});

// Injuries Section
export const InjuriesSectionSchema = z.object({
  currentInjuries: z.array(InjuryRecordSchema).default([]),
  pastInjuries: z.array(InjuryRecordSchema).default([]),
  movementRestrictions: z.array(z.string()).default([]),
  painAreas: z.array(z.string()).default([])
});

// Recovery Section
export const RecoverySectionSchema = z.object({
  sleepHours: z.number().min(3).max(12),
  sleepQuality: z.enum(['poor', 'fair', 'good', 'excellent']),
  stressLevel: z.enum(['low', 'moderate', 'high', 'very_high']),
  recoveryCapacity: z.enum(['low', 'moderate', 'high'])
});

// Nutrition Section
export const NutritionSectionSchema = z.object({
  nutritionApproach: z.enum(['maintenance', 'surplus', 'deficit', 'intuitive']),
  proteinIntake: z.enum(['low', 'moderate', 'high', 'very_high']),
  dietaryRestrictions: z.array(z.string()).default([]),
  supplementUse: z.array(z.string()).default([])
});

// Preferences Section
export const PreferencesSectionSchema = z.object({
  favouriteExercises: z.array(z.string()).default([]),
  dislikedExercises: z.array(z.string()).default([]),
  preferredSplit: z.enum([
    'full_body',
    'upper_lower',
    'push_pull_legs',
    'bro_split',
    'custom'
  ]).nullable().optional(),
  cardioPreference: z.enum(['none', 'minimal', 'moderate', 'extensive'])
});

// Constraints Section
export const ConstraintsSectionSchema = z.object({
  maxExercisesPerSession: z.number().nullable().optional(),
  timeConstraints: z.string().default(''),
  otherNotes: z.string().default('')
});

// Complete Questionnaire Data
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

// ============================================
// PLAN OUTPUT SCHEMAS
// ============================================

export const WarmupSchema = z.object({
  description: z.string(),
  exercises: z.array(z.string())
});

export const CooldownSchema = z.object({
  description: z.string(),
  exercises: z.array(z.string())
});

export const ExerciseSchema = z.object({
  name: z.string(),
  sets: z.number(),
  reps: z.string(),
  rest: z.string(),
  intent: z.string(),
  rationale: z.string(), // NEW: Specific reasoning for THIS user
  notes: z.string(),
  substitutions: z.array(z.string()),
  progressionNote: z.string().optional() // NEW: How to progress THIS movement
});

export const WorkoutDaySchema = z.object({
  dayNumber: z.number(),
  name: z.string(),
  focus: z.string(),
  duration: z.string(),
  warmup: WarmupSchema,
  exercises: z.array(ExerciseSchema),
  cooldown: CooldownSchema
});

export const GeneratedPlanSchema = z.object({
  planName: z.string(),
  overview: z.string(),
  weeklyStructure: z.string(),
  days: z.array(WorkoutDaySchema),
  progressionGuidance: z.string(),
  nutritionNotes: z.string(),
  recoveryNotes: z.string(),
  disclaimer: z.string()
});

// ============================================
// API SCHEMAS
// ============================================

export const GeneratePlanRequestSchema = z.object({
  questionnaire: QuestionnaireDataSchema,
  existingPlan: z.string().optional()
});

export const GeneratePlanResponseSchema = z.object({
  success: z.literal(true),
  plan: GeneratedPlanSchema
});

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string()
  })
});

// ============================================
// TYPE EXPORTS
// ============================================

export type GoalsSection = z.infer<typeof GoalsSectionSchema>;
export type ExperienceSection = z.infer<typeof ExperienceSectionSchema>;
export type AvailabilitySection = z.infer<typeof AvailabilitySectionSchema>;
export type EquipmentSection = z.infer<typeof EquipmentSectionSchema>;
export type InjuryRecord = z.infer<typeof InjuryRecordSchema>;
export type InjuriesSection = z.infer<typeof InjuriesSectionSchema>;
export type RecoverySection = z.infer<typeof RecoverySectionSchema>;
export type NutritionSection = z.infer<typeof NutritionSectionSchema>;
export type PreferencesSection = z.infer<typeof PreferencesSectionSchema>;
export type ConstraintsSection = z.infer<typeof ConstraintsSectionSchema>;
export type QuestionnaireData = z.infer<typeof QuestionnaireDataSchema>;

export type Warmup = z.infer<typeof WarmupSchema>;
export type Cooldown = z.infer<typeof CooldownSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type WorkoutDay = z.infer<typeof WorkoutDaySchema>;
export type GeneratedPlan = z.infer<typeof GeneratedPlanSchema>;

export type GeneratePlanRequest = z.infer<typeof GeneratePlanRequestSchema>;
export type GeneratePlanResponse = z.infer<typeof GeneratePlanResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// ============================================
// FORM STATE TYPES
// ============================================

export interface QuestionnaireFormState {
  currentStep: number;
  completedSteps: number[];
  data: Partial<QuestionnaireData>;
  mode: 'new' | 'update';
  existingPlan: string | null;
}

export type StepName =
  | 'goals'
  | 'experience'
  | 'availability'
  | 'equipment'
  | 'injuries'
  | 'recovery'
  | 'nutrition'
  | 'preferences'
  | 'constraints'
  | 'existingPlan';

export const STEP_ORDER: StepName[] = [
  'goals',
  'experience',
  'availability',
  'equipment',
  'injuries',
  'recovery',
  'nutrition',
  'preferences',
  'constraints'
];

export const STEP_ORDER_UPDATE: StepName[] = [
  'existingPlan',
  ...STEP_ORDER
];

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_QUESTIONNAIRE: QuestionnaireData = {
  goals: {
    primaryGoal: 'general_fitness',
    secondaryGoal: null,
    timeframe: '3 months',
    specificTargets: [],
    sportDetails: undefined
  },
  experience: {
    trainingYears: 0,
    currentLevel: 'beginner',
    recentTraining: '',
    strongPoints: [],
    weakPoints: [],
    trainingConsistency: 'mostly_consistent',
    currentBodyWeight: undefined,
    currentLifts: undefined
  },
  availability: {
    daysPerWeek: 3,
    sessionDuration: 60,
    preferredDays: [],
    timeOfDay: 'flexible'
  },
  equipment: {
    gymAccess: true,
    gymType: 'commercial',
    availableEquipment: [],
    limitedEquipment: []
  },
  injuries: {
    currentInjuries: [],
    pastInjuries: [],
    movementRestrictions: [],
    painAreas: []
  },
  recovery: {
    sleepHours: 7,
    sleepQuality: 'good',
    stressLevel: 'moderate',
    recoveryCapacity: 'moderate'
  },
  nutrition: {
    nutritionApproach: 'maintenance',
    proteinIntake: 'moderate',
    dietaryRestrictions: [],
    supplementUse: []
  },
  preferences: {
    favouriteExercises: [],
    dislikedExercises: [],
    preferredSplit: null,
    cardioPreference: 'minimal'
  },
  constraints: {
    maxExercisesPerSession: null,
    timeConstraints: '',
    otherNotes: ''
  }
};
