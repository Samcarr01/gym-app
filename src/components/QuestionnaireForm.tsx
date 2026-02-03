'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { StepIndicator } from '@/components/StepIndicator';
import { AlertCircle } from 'lucide-react';
import {
  QuestionnaireData,
  QuestionnaireDataSchema,
  DEFAULT_QUESTIONNAIRE,
  STEP_ORDER,
  STEP_ORDER_UPDATE,
  StepName
} from '@/lib/types';

// Loading component for lazy-loaded steps
const StepLoader = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
    <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Calibrating sensors</p>
    <p className="text-xs text-muted-foreground">Aligning the plan engine to your inputs.</p>
  </div>
);

// Lazy load step components for better initial bundle size
const GoalsStep = dynamic(() => import('@/components/steps/GoalsStep').then(m => ({ default: m.GoalsStep })), {
  loading: StepLoader,
});
const ExperienceStep = dynamic(() => import('@/components/steps/ExperienceStep').then(m => ({ default: m.ExperienceStep })), {
  loading: StepLoader,
});
const AvailabilityStep = dynamic(() => import('@/components/steps/AvailabilityStep').then(m => ({ default: m.AvailabilityStep })), {
  loading: StepLoader,
});
const EquipmentStep = dynamic(() => import('@/components/steps/EquipmentStep').then(m => ({ default: m.EquipmentStep })), {
  loading: StepLoader,
});
const InjuriesStep = dynamic(() => import('@/components/steps/InjuriesStep').then(m => ({ default: m.InjuriesStep })), {
  loading: StepLoader,
});
const RecoveryStep = dynamic(() => import('@/components/steps/RecoveryStep').then(m => ({ default: m.RecoveryStep })), {
  loading: StepLoader,
});
const NutritionStep = dynamic(() => import('@/components/steps/NutritionStep').then(m => ({ default: m.NutritionStep })), {
  loading: StepLoader,
});
const PreferencesStep = dynamic(() => import('@/components/steps/PreferencesStep').then(m => ({ default: m.PreferencesStep })), {
  loading: StepLoader,
});
const ConstraintsStep = dynamic(() => import('@/components/steps/ConstraintsStep').then(m => ({ default: m.ConstraintsStep })), {
  loading: StepLoader,
});
const ExistingPlanStep = dynamic(() => import('@/components/steps/ExistingPlanStep').then(m => ({ default: m.ExistingPlanStep })), {
  loading: StepLoader,
});

interface QuestionnaireFormProps {
  mode: 'new' | 'update';
}

const STORAGE_KEY = 'gym-plan-questionnaire';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stepComponents: Partial<Record<StepName, React.ComponentType<any>>> = {
  goals: GoalsStep,
  experience: ExperienceStep,
  availability: AvailabilityStep,
  equipment: EquipmentStep,
  injuries: InjuriesStep,
  recovery: RecoveryStep,
  nutrition: NutritionStep,
  preferences: PreferencesStep,
  constraints: ConstraintsStep,
};

const stepLabels: Record<StepName, string> = {
  goals: 'Goals',
  experience: 'Experience',
  availability: 'Schedule',
  equipment: 'Equipment',
  injuries: 'Injuries',
  recovery: 'Recovery',
  nutrition: 'Nutrition',
  preferences: 'Preferences',
  constraints: 'Constraints',
  existingPlan: 'Existing plan',
};

const coachNotes: Partial<Record<StepName, string>> = {
  goals: 'Pick the primary outcome. It anchors your split, volume, and progression.',
  experience: 'Be honest here. The plan adapts intensity and exercise complexity.',
  availability: 'Realistic scheduling beats perfect scheduling. Pick what you can repeat.',
  equipment: 'Tell us what you actually have access to. We will work within it.',
  injuries: 'Mention anything that hurts or limits you. Safety first.',
  recovery: 'Sleep and stress shape volume more than most people think.',
  nutrition: 'Simple guidance beats perfect tracking. Tell us your approach.',
  preferences: 'Favourites and dislikes help keep you consistent.',
  constraints: 'Anything else that makes this plan easier to follow.',
};

// Determine which steps can be skipped based on form data
function shouldSkipStep(stepName: StepName, data: Partial<QuestionnaireData>): boolean {
  // Skip injuries step if user selected "no injuries" quick option
  if (stepName === 'injuries' && data.injuries?.noInjuries) {
    return true;
  }

  // Skip detailed nutrition if user selected "intuitive" eating (they don't track)
  // Note: We still show nutrition step but it could be simplified
  // For now, no skip - nutrition guidance is still useful

  return false;
}

export function QuestionnaireForm({ mode }: QuestionnaireFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [existingPlan, setExistingPlan] = useState<string>('');
  const [showShake, setShowShake] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const formRef = useRef<HTMLDivElement>(null);

  const baseSteps = mode === 'update' ? STEP_ORDER_UPDATE : STEP_ORDER;

  const form = useForm<QuestionnaireData>({
    resolver: zodResolver(QuestionnaireDataSchema),
    defaultValues: DEFAULT_QUESTIONNAIRE,
    mode: 'onChange'
  });

  // Watch relevant fields for adaptive steps
  const noInjuries = form.watch('injuries.noInjuries');
  const primaryGoal = form.watch('goals.primaryGoal');
  const daysPerWeek = form.watch('availability.daysPerWeek');
  const gymAccess = form.watch('equipment.gymAccess');
  const sleepHours = form.watch('recovery.sleepHours');
  const cardioPreference = form.watch('preferences.cardioPreference');

  const formatDisplay = (value: unknown) => {
    if (value === undefined || value === null || value === '') return 'Not set';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toString();
    return String(value)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Compute active steps (filter out skipped ones)
  const steps = baseSteps.filter(step => {
    const formData = form.getValues();
    return !shouldSkipStep(step, formData);
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.data) form.reset(parsed.data);
        if (parsed.existingPlan) setExistingPlan(parsed.existingPlan);
        if (parsed.currentStep !== undefined) setCurrentStep(parsed.currentStep);
      } catch (e) {
        console.error('Failed to load saved form data');
      }
    }
  }, [form]);

  // Save to localStorage on change
  useEffect(() => {
    const subscription = form.watch((data) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        data, existingPlan, currentStep, mode
      }));
    });
    return () => subscription.unsubscribe();
  }, [form, existingPlan, currentStep, mode]);

  const currentStepName = steps[currentStep];
  const StepComponent = stepComponents[currentStepName];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const nextStepName = steps[currentStep + 1];
  const nextStepLabel = nextStepName ? stepLabels[nextStepName] : 'Next';

  const handleNext = async () => {
    const stepFields = getStepFields(currentStepName);
    const isValid = await form.trigger(stepFields as any);

    if (isValid) {
      setValidationErrors([]);
      if (isLastStep) {
        handleSubmit();
      } else {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      // Get error messages for current step
      const errors = stepFields
        .map(field => {
          const error = form.formState.errors;
          const parts = field.split('.');
          let current: any = error;
          for (const part of parts) {
            current = current?.[part];
          }
          return current?.message as string | undefined;
        })
        .filter(Boolean) as string[];

      setValidationErrors(errors);

      // Trigger shake animation
      setShowShake(true);
      setTimeout(() => setShowShake(false), 500);

      // Scroll to form top to show errors
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setValidationErrors([]);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const data = form.getValues();
    sessionStorage.setItem('questionnaire-data', JSON.stringify({
      questionnaire: data,
      existingPlan: mode === 'update' ? existingPlan : undefined
    }));
    localStorage.removeItem(STORAGE_KEY);
    router.push('/generate');
  };

  return (
    <FormProvider {...form}>
      <div ref={formRef} className={`glass-panel p-6 md:p-8 space-y-6 ${showShake ? 'animate-shake' : ''}`}>
        <StepIndicator
          totalSteps={steps.length}
          currentStep={currentStep}
          completedSteps={Array.from({ length: currentStep }, (_, i) => i)}
          stepNames={steps}
          stepLabels={stepLabels}
        />

        {currentStepName && coachNotes[currentStepName] && (
          <div className="soft-card p-4 text-sm text-muted-foreground">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Coach note</p>
            <p className="mt-2">{coachNotes[currentStepName]}</p>
          </div>
        )}

        <div className="soft-card p-4 space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Signal preview</p>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Primary goal</span>
              <span className="font-semibold text-foreground">{formatDisplay(primaryGoal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Days per week</span>
              <span className="font-semibold text-foreground">{daysPerWeek ? `${daysPerWeek} days` : 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Gym access</span>
              <span className="font-semibold text-foreground">{gymAccess === undefined ? 'Not set' : gymAccess ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sleep</span>
              <span className="font-semibold text-foreground">{sleepHours ? `${sleepHours} hrs` : 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cardio</span>
              <span className="font-semibold text-foreground">{formatDisplay(cardioPreference)}</span>
            </div>
          </div>
        </div>

        {/* Validation error summary */}
        {validationErrors.length > 0 && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-destructive">Please fix the following:</p>
                <ul className="list-disc list-inside text-destructive/80 space-y-1">
                  {validationErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div key={currentStepName} className="min-h-[400px] animate-rise">
          {currentStepName === 'existingPlan' ? (
            <ExistingPlanStep value={existingPlan} onChange={setExistingPlan} />
          ) : StepComponent ? (
            <StepComponent form={form} />
          ) : null}
        </div>
        <div className="flex flex-col gap-4 pt-6 border-t border-border/50 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={handleBack} disabled={isFirstStep}>
            Back
          </Button>
          <Button type="button" onClick={handleNext}>
            {isLastStep ? 'Generate Plan' : `Next: ${nextStepLabel}`}
          </Button>
        </div>
      </div>
    </FormProvider>
  );
}

function getStepFields(step: StepName): string[] {
  const fieldMap: Record<StepName, string[]> = {
    goals: ['goals.primaryGoal', 'goals.timeframe'],
    experience: ['experience.currentLevel', 'experience.trainingYears'],
    availability: ['availability.daysPerWeek', 'availability.sessionDuration', 'availability.timeOfDay'],
    equipment: ['equipment.gymAccess'],
    injuries: [],
    recovery: ['recovery.sleepHours', 'recovery.sleepQuality', 'recovery.stressLevel', 'recovery.recoveryCapacity'],
    nutrition: ['nutrition.nutritionApproach', 'nutrition.proteinIntake'],
    preferences: ['preferences.cardioPreference'],
    constraints: [],
    existingPlan: [],
  };
  return fieldMap[step] || [];
}
