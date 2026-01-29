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
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Step {currentStep + 1} of {totalSteps}
        </span>
        {stepNames && stepNames[currentStep] && (
          <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs uppercase tracking-[0.2em]">
            {stepNames[currentStep].replace('_', ' ')}
          </span>
        )}
      </div>

      <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary/70 via-primary to-emerald-400/70 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {stepNames && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {stepNames.map((name, index) => {
            const isActive = index === currentStep;
            const isDone = completedSteps.includes(index);
            return (
              <span
                key={name}
                className={[
                  'rounded-full border px-3 py-1 uppercase tracking-[0.2em]',
                  isActive ? 'border-primary/50 bg-primary/15 text-primary' : '',
                  isDone ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : '',
                  !isActive && !isDone ? 'border-border/50 bg-muted/40' : ''
                ].join(' ')}
              >
                {name.replace('_', ' ')}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
