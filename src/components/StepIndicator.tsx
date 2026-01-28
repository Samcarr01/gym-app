import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
  completedSteps: number[];
  stepNames?: string[];
}

export function StepIndicator({
  totalSteps,
  currentStep,
  completedSteps,
  stepNames
}: StepIndicatorProps) {
  return (
    <div className="mb-8">
      {/* Progress bar */}
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step counter */}
      <div className="flex justify-between mt-2">
        <span className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}
        </span>
        {stepNames && stepNames[currentStep] && (
          <span className="text-sm font-medium capitalize">
            {stepNames[currentStep].replace('_', ' ')}
          </span>
        )}
      </div>
    </div>
  );
}
