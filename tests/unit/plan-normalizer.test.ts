import { describe, it, expect } from 'vitest';
import { normalizePlan, recommendSplit } from '@/lib/plan-normalizer';
import { GeneratedPlan, QuestionnaireData, DEFAULT_QUESTIONNAIRE } from '@/lib/types';

// Helper to create a minimal questionnaire
function createQuestionnaire(overrides: Partial<QuestionnaireData> = {}): QuestionnaireData {
  return {
    ...DEFAULT_QUESTIONNAIRE,
    ...overrides,
    goals: { ...DEFAULT_QUESTIONNAIRE.goals, ...overrides.goals },
    experience: { ...DEFAULT_QUESTIONNAIRE.experience, ...overrides.experience },
    availability: { ...DEFAULT_QUESTIONNAIRE.availability, ...overrides.availability },
    equipment: { ...DEFAULT_QUESTIONNAIRE.equipment, ...overrides.equipment },
    recovery: { ...DEFAULT_QUESTIONNAIRE.recovery, ...overrides.recovery },
    preferences: { ...DEFAULT_QUESTIONNAIRE.preferences, ...overrides.preferences },
    constraints: { ...DEFAULT_QUESTIONNAIRE.constraints, ...overrides.constraints },
  };
}

// Helper to create a minimal plan
function createPlan(days: Array<{ name: string; focus: string; exercises: Array<{ name: string }> }>): GeneratedPlan {
  return {
    planName: 'Test Plan',
    overview: 'Test overview',
    weeklyStructure: 'Test structure',
    days: days.map((day, i) => ({
      dayNumber: i + 1,
      name: day.name,
      focus: day.focus,
      duration: '60 minutes',
      warmup: { description: 'Test warmup', exercises: ['Arm circles'] },
      exercises: day.exercises.map(ex => ({
        name: ex.name,
        sets: 3,
        reps: '8-12',
        rest: '90 seconds',
        intent: 'Test intent',
        rationale: 'Test rationale',
        notes: 'Test notes',
        substitutions: [],
        progressionNote: 'Test progression'
      })),
      cooldown: { description: 'Test cooldown', exercises: ['Stretch'] }
    })),
    progressionGuidance: 'Test progression',
    nutritionNotes: 'Test nutrition with breakfast and lunch examples',
    recoveryNotes: 'Test recovery'
  };
}

describe('recommendSplit', () => {
  it('should recommend full body for 2 days', () => {
    const questionnaire = createQuestionnaire({
      availability: { ...DEFAULT_QUESTIONNAIRE.availability, daysPerWeek: 2 }
    });
    expect(recommendSplit(questionnaire)).toContain('Full Body');
  });

  it('should recommend full body for 3 days', () => {
    const questionnaire = createQuestionnaire({
      availability: { ...DEFAULT_QUESTIONNAIRE.availability, daysPerWeek: 3 }
    });
    expect(recommendSplit(questionnaire)).toContain('Full Body');
  });

  it('should recommend upper/lower for 4 days', () => {
    const questionnaire = createQuestionnaire({
      availability: { ...DEFAULT_QUESTIONNAIRE.availability, daysPerWeek: 4 }
    });
    expect(recommendSplit(questionnaire)).toContain('Upper/Lower');
  });

  it('should recommend PPL for 6 days with high recovery', () => {
    const questionnaire = createQuestionnaire({
      availability: { ...DEFAULT_QUESTIONNAIRE.availability, daysPerWeek: 6 },
      recovery: { ...DEFAULT_QUESTIONNAIRE.recovery, recoveryCapacity: 'high' }
    });
    expect(recommendSplit(questionnaire)).toContain('Push/Pull/Legs');
  });
});

describe('normalizePlan - Exercise Ordering', () => {
  it('should order compound movements before isolation', () => {
    const plan = createPlan([{
      name: 'Upper Body',
      focus: 'Upper',
      exercises: [
        { name: 'Bicep Curl' },
        { name: 'Bench Press' },
        { name: 'Lateral Raise' },
        { name: 'Pull-Up' }
      ]
    }]);

    const questionnaire = createQuestionnaire({
      constraints: { ...DEFAULT_QUESTIONNAIRE.constraints, maxExercisesPerSession: 6 }
    });

    const normalized = normalizePlan(plan, questionnaire);
    const exerciseNames = normalized.days[0].exercises.map(e => e.name);

    // Compounds (Bench Press, Pull-Up) should come before isolations (Bicep Curl, Lateral Raise)
    const benchIndex = exerciseNames.findIndex(n => n.toLowerCase().includes('bench'));
    const pullupIndex = exerciseNames.findIndex(n => n.toLowerCase().includes('pull'));
    const curlIndex = exerciseNames.findIndex(n => n.toLowerCase().includes('curl'));
    const raiseIndex = exerciseNames.findIndex(n => n.toLowerCase().includes('raise'));

    expect(benchIndex).toBeLessThan(curlIndex);
    expect(pullupIndex).toBeLessThan(raiseIndex);
  });

  it('should prioritize weak point exercises', () => {
    const plan = createPlan([{
      name: 'Upper Body',
      focus: 'Upper',
      exercises: [
        { name: 'Dumbbell Row' },
        { name: 'Bench Press' },
        { name: 'Overhead Press' }
      ]
    }]);

    const questionnaire = createQuestionnaire({
      experience: {
        ...DEFAULT_QUESTIONNAIRE.experience,
        weakPoints: ['chest']
      },
      constraints: { ...DEFAULT_QUESTIONNAIRE.constraints, maxExercisesPerSession: 6 }
    });

    const normalized = normalizePlan(plan, questionnaire);
    const exerciseNames = normalized.days[0].exercises.map(e => e.name);

    // Bench Press (targets weak chest) should come first
    const benchIndex = exerciseNames.findIndex(n => n.toLowerCase().includes('bench'));
    expect(benchIndex).toBe(0);
  });

  it('should remove duplicate exercises', () => {
    const plan = createPlan([{
      name: 'Upper Body',
      focus: 'Upper',
      exercises: [
        { name: 'Pull-Up' },
        { name: 'Bench Press' },
        { name: 'Pull-Up' }, // Duplicate
        { name: 'Dumbbell Row' }
      ]
    }]);

    const questionnaire = createQuestionnaire({
      constraints: { ...DEFAULT_QUESTIONNAIRE.constraints, maxExercisesPerSession: 6 }
    });

    const normalized = normalizePlan(plan, questionnaire);
    const exerciseNames = normalized.days[0].exercises.map(e => e.name.toLowerCase());
    const pullupCount = exerciseNames.filter(n => n.includes('pull-up') || n.includes('pull up')).length;

    expect(pullupCount).toBe(1);
  });
});

describe('normalizePlan - Equipment Filtering', () => {
  it('should replace machine exercises when no gym access', () => {
    const plan = createPlan([{
      name: 'Lower Body',
      focus: 'Lower',
      exercises: [
        { name: 'Leg Press' },
        { name: 'Leg Curl' },
        { name: 'Leg Extension' }
      ]
    }]);

    const questionnaire = createQuestionnaire({
      equipment: {
        ...DEFAULT_QUESTIONNAIRE.equipment,
        gymAccess: false,
        availableEquipment: ['dumbbells', 'resistance bands'],
        limitedEquipment: []
      },
      constraints: { ...DEFAULT_QUESTIONNAIRE.constraints, maxExercisesPerSession: 6 }
    });

    const normalized = normalizePlan(plan, questionnaire);
    const exerciseNames = normalized.days[0].exercises.map(e => e.name.toLowerCase());

    // Should not contain machine exercises
    expect(exerciseNames.some(n => n.includes('leg press'))).toBe(false);
    expect(exerciseNames.some(n => n.includes('leg curl') && !n.includes('nordic'))).toBe(false);
    expect(exerciseNames.some(n => n.includes('leg extension') && !n.includes('sissy'))).toBe(false);
  });

  it('should keep gym exercises when gym access is available', () => {
    const plan = createPlan([{
      name: 'Lower Body',
      focus: 'Lower',
      exercises: [
        { name: 'Leg Press' },
        { name: 'Leg Curl' }
      ]
    }]);

    const questionnaire = createQuestionnaire({
      equipment: {
        ...DEFAULT_QUESTIONNAIRE.equipment,
        gymAccess: true,
        gymType: 'commercial',
        availableEquipment: ['barbell', 'machines', 'cables'],
        limitedEquipment: []
      },
      constraints: { ...DEFAULT_QUESTIONNAIRE.constraints, maxExercisesPerSession: 6 }
    });

    const normalized = normalizePlan(plan, questionnaire);
    const exerciseNames = normalized.days[0].exercises.map(e => e.name.toLowerCase());

    // Should keep machine exercises
    expect(exerciseNames.some(n => n.includes('leg press'))).toBe(true);
    expect(exerciseNames.some(n => n.includes('leg curl'))).toBe(true);
  });

  it('should use home-friendly accessory pool when no gym', () => {
    const plan = createPlan([{
      name: 'Upper Body',
      focus: 'Upper',
      exercises: [
        { name: 'Push-Up' }
      ]
    }]);

    const questionnaire = createQuestionnaire({
      equipment: {
        ...DEFAULT_QUESTIONNAIRE.equipment,
        gymAccess: false,
        availableEquipment: ['dumbbells'],
        limitedEquipment: []
      },
      constraints: { ...DEFAULT_QUESTIONNAIRE.constraints, maxExercisesPerSession: 6 }
    });

    const normalized = normalizePlan(plan, questionnaire);
    const exerciseNames = normalized.days[0].exercises.map(e => e.name.toLowerCase());

    // Should not have cable or machine exercises from filler
    const hasCableOrMachine = exerciseNames.some(n =>
      n.includes('cable') || n.includes('lat pulldown') ||
      n.includes('machine') || n.includes('pushdown')
    );

    expect(hasCableOrMachine).toBe(false);
  });
});

describe('normalizePlan - Disliked Exercises', () => {
  it('should remove disliked exercises', () => {
    const plan = createPlan([{
      name: 'Upper Body',
      focus: 'Upper',
      exercises: [
        { name: 'Bench Press' },
        { name: 'Burpees' },
        { name: 'Pull-Up' }
      ]
    }]);

    const questionnaire = createQuestionnaire({
      preferences: {
        ...DEFAULT_QUESTIONNAIRE.preferences,
        dislikedExercises: ['burpees']
      },
      constraints: { ...DEFAULT_QUESTIONNAIRE.constraints, maxExercisesPerSession: 6 }
    });

    const normalized = normalizePlan(plan, questionnaire);
    const exerciseNames = normalized.days[0].exercises.map(e => e.name.toLowerCase());

    expect(exerciseNames.some(n => n.includes('burpee'))).toBe(false);
  });
});

describe('normalizePlan - Max Exercises', () => {
  it('should respect max exercises per session', () => {
    const plan = createPlan([{
      name: 'Upper Body',
      focus: 'Upper',
      exercises: [
        { name: 'Bench Press' },
        { name: 'Pull-Up' },
        { name: 'Overhead Press' },
        { name: 'Dumbbell Row' },
        { name: 'Bicep Curl' },
        { name: 'Tricep Extension' },
        { name: 'Lateral Raise' },
        { name: 'Face Pull' }
      ]
    }]);

    const questionnaire = createQuestionnaire({
      constraints: { ...DEFAULT_QUESTIONNAIRE.constraints, maxExercisesPerSession: 5 }
    });

    const normalized = normalizePlan(plan, questionnaire);

    expect(normalized.days[0].exercises.length).toBeLessThanOrEqual(5);
  });

  it('should fill exercises to max count', () => {
    const plan = createPlan([{
      name: 'Upper Body',
      focus: 'Upper',
      exercises: [
        { name: 'Bench Press' },
        { name: 'Pull-Up' }
      ]
    }]);

    const questionnaire = createQuestionnaire({
      constraints: { ...DEFAULT_QUESTIONNAIRE.constraints, maxExercisesPerSession: 6 }
    });

    const normalized = normalizePlan(plan, questionnaire);

    expect(normalized.days[0].exercises.length).toBe(6);
  });
});
