import { QuestionnaireData } from '@/lib/types';
import { recommendSplit } from '@/lib/plan-normalizer';

export interface ProgramDesign {
  split: string;
  daysPerWeek: number;
  sessionDuration: number;
  goal: string;
  primaryFocus: string;
  mainRepRange: string;
  accessoryRepRange: string;
  restMain: string;
  restAccessory: string;
  weeklySetTarget: string;
  progressionModel: string;
  deloadGuidance: string;
  cardioGuidance: string;
  recoveryModifier: string;
}

function repRestForGoal(goal: QuestionnaireData['goals']['primaryGoal']) {
  switch (goal) {
    case 'strength':
      return { main: '3-6', accessory: '6-10', restMain: '2-3 min', restAccessory: '90-120 sec' };
    case 'muscle_building':
      return { main: '6-10', accessory: '8-15', restMain: '90-120 sec', restAccessory: '60-90 sec' };
    case 'fat_loss':
      return { main: '8-12', accessory: '10-15', restMain: '90 sec', restAccessory: '45-75 sec' };
    case 'endurance':
      return { main: '12-20', accessory: '15-20', restMain: '60-90 sec', restAccessory: '45-60 sec' };
    case 'sport_specific':
      return { main: '3-6', accessory: '6-10', restMain: '2-3 min', restAccessory: '90-120 sec' };
    case 'general_fitness':
    default:
      return { main: '6-12', accessory: '8-15', restMain: '90 sec', restAccessory: '60-90 sec' };
  }
}

function weeklySetsByLevel(level: QuestionnaireData['experience']['currentLevel']): string {
  if (level === 'beginner') return '8-12 hard sets per muscle group/week';
  if (level === 'intermediate') return '12-16 hard sets per muscle group/week';
  return '14-20 hard sets per muscle group/week';
}

function progressionByLevel(level: QuestionnaireData['experience']['currentLevel']): string {
  if (level === 'beginner') {
    return 'Linear progression: add 1-2 reps per set weekly, then increase load once the top of the range is achieved.';
  }
  if (level === 'intermediate') {
    return 'Wave progression: 3 weeks building volume/intensity, then a lighter week; repeat.';
  }
  return 'Block progression: 4-6 week blocks (accumulation → intensification → deload).';
}

function deloadGuidance(
  level: QuestionnaireData['experience']['currentLevel'],
  recovery: QuestionnaireData['recovery'],
  trainingYears: number
): string {
  // Calculate deload frequency based on multiple factors
  let deloadFrequency: number;
  let volumeReduction: string;
  let deloadStrategy: string;

  // Base frequency by level
  if (level === 'beginner') {
    deloadFrequency = 8;
    volumeReduction = '20-30%';
    deloadStrategy = 'reduce sets by half, keep weight the same';
  } else if (level === 'intermediate') {
    deloadFrequency = 4;
    volumeReduction = '30-40%';
    deloadStrategy = 'reduce sets by 40% and weight by 10-20%';
  } else {
    deloadFrequency = 4;
    volumeReduction = '40-50%';
    deloadStrategy = 'reduce both volume and intensity significantly';
  }

  // Adjust for recovery factors
  if (recovery.stressLevel === 'high' || recovery.stressLevel === 'very_high') {
    deloadFrequency = Math.max(3, deloadFrequency - 1);
  }
  if (recovery.recoveryCapacity === 'low') {
    deloadFrequency = Math.max(3, deloadFrequency - 1);
  }
  if (recovery.sleepQuality === 'poor' || recovery.sleepHours < 6) {
    deloadFrequency = Math.max(3, deloadFrequency - 1);
  }

  // Adjust for training age
  if (trainingYears > 5) {
    deloadFrequency = Math.max(3, deloadFrequency - 1);
  }

  // Build the guidance string
  const frequencyText = level === 'beginner'
    ? `Deload every ${deloadFrequency}-${deloadFrequency + 2} weeks if fatigue accumulates`
    : `Deload every ${deloadFrequency} weeks (week ${deloadFrequency} of each cycle)`;

  const deloadWeekDetails = `During deload: ${deloadStrategy}. Reduce volume by ~${volumeReduction}. Maintain movement patterns but prioritize recovery. Good time for mobility work, light cardio, and extra sleep.`;

  const warningSignals = 'Signs you need an early deload: persistent fatigue, strength regression, poor sleep, elevated resting heart rate, or decreased motivation.';

  return `${frequencyText}. ${deloadWeekDetails} ${warningSignals}`;
}

function cardioGuidance(pref: QuestionnaireData['preferences']['cardioPreference']): string {
  switch (pref) {
    case 'none':
      return 'No dedicated cardio required beyond warm-ups.';
    case 'minimal':
      return '1 short low-intensity session or warm-up cardio 2-3x/week.';
    case 'moderate':
      return '1-2 cardio sessions/week (20-30 min), preferably low-impact.';
    case 'extensive':
      return '3+ cardio sessions/week, mix of low-intensity and intervals.';
    default:
      return 'Light cardio as desired.';
  }
}

function recoveryModifier(recovery: QuestionnaireData['recovery']): string {
  if (recovery.stressLevel === 'high' || recovery.stressLevel === 'very_high' || recovery.recoveryCapacity === 'low') {
    return 'Reduce volume by ~10-20% and prioritize sleep/recovery.';
  }
  if (recovery.sleepHours < 6 || recovery.sleepQuality === 'poor') {
    return 'Keep intensity moderate and prioritize technique and recovery.';
  }
  return 'Normal progression is appropriate given recovery capacity.';
}

export function buildProgramDesign(questionnaire: QuestionnaireData): ProgramDesign {
  const split = recommendSplit(questionnaire);
  const repRest = repRestForGoal(questionnaire.goals.primaryGoal);

  const primaryFocus = questionnaire.goals.primaryGoal.replace('_', ' ');

  return {
    split,
    daysPerWeek: questionnaire.availability.daysPerWeek,
    sessionDuration: questionnaire.availability.sessionDuration,
    goal: questionnaire.goals.primaryGoal.replace('_', ' '),
    primaryFocus,
    mainRepRange: repRest.main,
    accessoryRepRange: repRest.accessory,
    restMain: repRest.restMain,
    restAccessory: repRest.restAccessory,
    weeklySetTarget: weeklySetsByLevel(questionnaire.experience.currentLevel),
    progressionModel: progressionByLevel(questionnaire.experience.currentLevel),
    deloadGuidance: deloadGuidance(
      questionnaire.experience.currentLevel,
      questionnaire.recovery,
      questionnaire.experience.trainingYears
    ),
    cardioGuidance: cardioGuidance(questionnaire.preferences.cardioPreference),
    recoveryModifier: recoveryModifier(questionnaire.recovery)
  };
}

export function programDesignToPrompt(design: ProgramDesign): string {
  return `
Program design blueprint:
- Split: ${design.split}
- Days/Week: ${design.daysPerWeek}
- Session Duration: ${design.sessionDuration} minutes
- Goal Focus: ${design.primaryFocus}
- Main lift reps: ${design.mainRepRange} | Accessory reps: ${design.accessoryRepRange}
- Rest: main ${design.restMain} | accessory ${design.restAccessory}
- Weekly volume target: ${design.weeklySetTarget}
- Progression model: ${design.progressionModel}
- Deload guidance: ${design.deloadGuidance}
- Cardio guidance: ${design.cardioGuidance}
- Recovery modifier: ${design.recoveryModifier}
`.trim();
}
