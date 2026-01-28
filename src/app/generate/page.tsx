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

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Building your plan...</h2>
        <p className="text-muted-foreground">{statusMessage}</p>
      </div>
      <div className="w-full max-w-md space-y-2">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Elapsed: {elapsedSeconds}s</span>
          <span className="capitalize">{statusStage.replace('_', ' ')}</span>
        </div>
      </div>
      <div className="flex gap-2 text-xs text-muted-foreground">
        <span className="animate-pulse">Analysing your profile</span>
        <span>•</span>
        <span className="animate-pulse delay-75">Selecting exercises</span>
        <span>•</span>
        <span className="animate-pulse delay-150">Building structure</span>
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
