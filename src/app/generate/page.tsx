'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GeneratedPlan, QuestionnaireData } from '@/lib/types';
import { generatePlanStream } from '@/lib/api';
import { PlanViewer } from '@/components/PlanViewer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type PageState = 'loading' | 'success' | 'error';

export default function GeneratePage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>('loading');
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [error, setError] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Starting...');
  const [statusStage, setStatusStage] = useState('starting');

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        // Get questionnaire data from session storage
        const stored = sessionStorage.getItem('questionnaire-data');

        if (!stored) {
          setError('No questionnaire data found. Please start over.');
          setState('error');
          return;
        }

        const { questionnaire, existingPlan } = JSON.parse(stored) as {
          questionnaire: QuestionnaireData;
          existingPlan?: string;
        };

        const generatedPlan = await generatePlanStream(
          questionnaire,
          existingPlan,
          (update) => {
            setProgress(update.progress ?? 0);
            setStatusMessage(update.message || 'Working...');
            setStatusStage(update.stage || 'working');
          }
        );
        setPlan(generatedPlan);
        setState('success');

        // Clear session storage after successful generation
        sessionStorage.removeItem('questionnaire-data');

      } catch (err) {
        console.error('Failed to generate plan:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate plan');
        setState('error');
      }
    };

    fetchPlan();
  }, []);

  useEffect(() => {
    if (state !== 'loading') return;
    const start = Date.now();
    const id = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [state]);

  const handleRetry = () => {
    setState('loading');
    setError('');
    setElapsedSeconds(0);
    setProgress(0);
    setStatusMessage('Starting...');
    setStatusStage('starting');
    // Re-trigger the effect
    window.location.reload();
  };

  const handleStartOver = () => {
    sessionStorage.removeItem('questionnaire-data');
    router.push('/');
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {state === 'loading' && (
          <LoadingState
            elapsedSeconds={elapsedSeconds}
            progress={progress}
            statusMessage={statusMessage}
            statusStage={statusStage}
          />
        )}
        {state === 'success' && plan && <PlanViewer plan={plan} />}
        {state === 'error' && (
          <ErrorState
            message={error}
            onRetry={handleRetry}
            onStartOver={handleStartOver}
          />
        )}
      </div>
    </main>
  );
}

function LoadingState({
  elapsedSeconds,
  progress,
  statusMessage,
  statusStage
}: {
  elapsedSeconds: number;
  progress: number;
  statusMessage: string;
  statusStage: string;
}) {
  const clampedProgress = Math.min(100, Math.max(5, progress || 5));
  const stages = [
    { id: 'validate', label: 'Validating inputs' },
    { id: 'prepare', label: 'Building blueprint' },
    { id: 'generate', label: 'Generating plan' },
    { id: 'finalize', label: 'Final touches' }
  ];
  const stageIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.id === statusStage)
  );

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="relative w-full max-w-2xl">
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-emerald-400/5 to-transparent blur-2xl" />
        <div className="relative rounded-2xl border bg-card/80 backdrop-blur p-8 md:p-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-md" />
              <div className="absolute inset-0 rounded-full border border-primary/30" />
              <div className="absolute inset-1 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Live generation
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">Building your plan</h2>
              <p className="text-sm text-muted-foreground">{statusMessage}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative h-2.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary/60 via-primary to-emerald-400/70 transition-all duration-700"
                style={{ width: `${clampedProgress}%` }}
              />
              <div className="absolute inset-0 animate-[shine_2.2s_linear_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]" />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{clampedProgress}% complete</span>
              <span>Elapsed: {elapsedSeconds}s</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              {stages.map((stage, index) => {
                const isActive = index === stageIndex;
                const isDone = index < stageIndex;
                return (
                  <div key={stage.id} className="flex items-center gap-3 text-sm">
                    <span
                      className={[
                        'h-2.5 w-2.5 rounded-full',
                        isDone ? 'bg-primary' : '',
                        isActive ? 'bg-primary ring-4 ring-primary/20' : '',
                        !isDone && !isActive ? 'bg-muted-foreground/40' : ''
                      ].join(' ')}
                    />
                    <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground space-y-2">
              <p className="text-sm text-foreground">What the AI is doing</p>
              <p>Applying your goals, targets, and recovery inputs to choose the split and volume.</p>
              <p>Injecting the knowledge base and refining the plan for your constraints.</p>
              <p className="text-primary/80">This stays live until the plan is ready.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
  onStartOver
}: {
  message: string;
  onRetry: () => void;
  onStartOver: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <Card className="p-8 max-w-md text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
          <span className="text-3xl">😕</span>
        </div>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onRetry}>Try Again</Button>
          <Button variant="outline" onClick={onStartOver}>Start Over</Button>
        </div>
      </Card>
    </div>
  );
}
