interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
  completedSteps: number[];
  stepNames?: string[];
  stepLabels?: Record<string, string>;
}

function formatStepLabel(name: string, stepLabels?: Record<string, string>) {
  if (stepLabels?.[name]) {
    return stepLabels[name];
  }
  return name.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function StepIndicator({
  totalSteps,
  currentStep,
  completedSteps,
  stepNames,
  stepLabels
}: StepIndicatorProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentLabel = stepNames?.[currentStep]
    ? formatStepLabel(stepNames[currentStep], stepLabels)
    : '';

  return (
    <div className="mb-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative h-12 w-12 sm:h-14 sm:w-14">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(hsl(var(--primary)) ${progress}%, hsl(var(--border)) ${progress}%)`
              }}
            />
            <div className="absolute inset-1 rounded-full bg-background/90 flex items-center justify-center text-xs font-semibold">
              {Math.round(progress)}%
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Mission progress</p>
            <p className="text-lg font-semibold">Step {currentStep + 1} of {totalSteps}</p>
            {currentLabel && (
              <p className="text-sm text-muted-foreground">Currently: {currentLabel}</p>
            )}
          </div>
        </div>
        <div className="soft-card px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted-foreground w-full sm:w-auto text-center">
          Auto-save on
        </div>
      </div>

      <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary/60 via-primary to-emerald-400/70 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {stepNames && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {stepNames.map((name, index) => {
            const isActive = index === currentStep;
            const isDone = completedSteps.includes(index);
            const label = formatStepLabel(name, stepLabels);
            return (
              <span
                key={name}
                className={[
                  'rounded-full border px-3 py-1 uppercase tracking-[0.2em]',
                  isActive ? 'border-primary/50 bg-primary/15 text-primary' : '',
                  isDone ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : '',
                  !isActive && !isDone ? 'border-border/60 bg-muted/40' : ''
                ].join(' ')}
              >
                {label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
