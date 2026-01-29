'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { StepIndicator } from '@/components/StepIndicator';
import {
  QuestionnaireData,
  QuestionnaireDataSchema,
  DEFAULT_QUESTIONNAIRE,
  STEP_ORDER,
  STEP_ORDER_UPDATE,
  StepName
} from '@/lib/types';

// Step components
import { GoalsStep } from '@/components/steps/GoalsStep';
import { ExperienceStep } from '@/components/steps/ExperienceStep';
import { AvailabilityStep } from '@/components/steps/AvailabilityStep';
import { EquipmentStep } from '@/components/steps/EquipmentStep';
import { InjuriesStep } from '@/components/steps/InjuriesStep';
import { RecoveryStep } from '@/components/steps/RecoveryStep';
import { NutritionStep } from '@/components/steps/NutritionStep';
import { PreferencesStep } from '@/components/steps/PreferencesStep';
import { ConstraintsStep } from '@/components/steps/ConstraintsStep';
import { ExistingPlanStep } from '@/components/steps/ExistingPlanStep';

interface QuestionnaireFormProps {
  mode: 'new' | 'update';
}

const STORAGE_KEY = 'gym-plan-questionnaire';

const stepComponents: Partial<Record<StepName, React.ComponentType<{ form: any }>>> = {
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

export function QuestionnaireForm({ mode }: QuestionnaireFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [existingPlan, setExistingPlan] = useState<string>('');

  const steps = mode === 'update' ? STEP_ORDER_UPDATE : STEP_ORDER;

  const form = useForm<QuestionnaireData>({
    resolver: zodResolver(QuestionnaireDataSchema),
    defaultValues: DEFAULT_QUESTIONNAIRE,
    mode: 'onChange'
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

  const handleNext = async () => {
    const stepFields = getStepFields(currentStepName);
    const isValid = await form.trigger(stepFields as any);

    if (isValid) {
      if (isLastStep) {
        handleSubmit();
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (!isFirstStep) setCurrentStep(prev => prev - 1);
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
      <div className="glass-panel p-6 md:p-8 space-y-6">
        <StepIndicator
          totalSteps={steps.length}
          currentStep={currentStep}
          completedSteps={Array.from({ length: currentStep }, (_, i) => i)}
          stepNames={steps}
        />
        <div className="min-h-[400px]">
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
            {isLastStep ? 'Generate Plan' : 'Next'}
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
