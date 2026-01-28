'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GeneratedPlan, QuestionnaireData } from '@/lib/types';
import { generatePlanAPI } from '@/lib/api';
import { PlanViewer } from '@/components/PlanViewer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type PageState = 'loading' | 'success' | 'error';

export default function GeneratePage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>('loading');
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [error, setError] = useState<string>('');

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

        const generatedPlan = await generatePlanAPI(questionnaire, existingPlan);
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

  const handleRetry = () => {
    setState('loading');
    setError('');
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
        {state === 'loading' && <LoadingState />}
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

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Building your plan...</h2>
        <p className="text-muted-foreground">This usually takes 15-30 seconds</p>
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
