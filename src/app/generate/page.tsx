'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GeneratedPlan, QuestionnaireData } from '@/lib/types';
import { generatePlanStream, QualityReport } from '@/lib/api';
import { PlanViewer } from '@/components/PlanViewer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type PageState = 'loading' | 'success' | 'error';

export default function GeneratePage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>('loading');
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
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

        const result = await generatePlanStream(
          questionnaire,
          existingPlan,
          (update) => {
            setProgress(update.progress ?? 0);
            setStatusMessage(update.message || 'Working...');
            setStatusStage(update.stage || 'working');
          }
        );
        setPlan(result.plan);
        setQualityReport(result.qualityReport);
        setState('success');

        // Log quality report to browser console for debugging
        console.group('Plan Quality Report');
        console.log('First attempt:', result.qualityReport.firstAttempt.valid ? 'PASSED' : `FAILED (${result.qualityReport.firstAttempt.issues.length} issues)`);
        if (!result.qualityReport.firstAttempt.valid) {
          console.log('Issues:', result.qualityReport.firstAttempt.issues);
        }
        result.qualityReport.retryAttempts.forEach((attempt, i) => {
          console.log(`Retry ${i + 1}:`, attempt.valid ? 'PASSED' : `FAILED (${attempt.issues.length} issues)`);
          if (!attempt.valid) console.log('Issues:', attempt.issues);
        });
        console.log('Final status:', result.qualityReport.finalStatus);
        console.log('Total attempts:', result.qualityReport.totalAttempts);
        console.groupEnd();

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
    setQualityReport(null);
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
        {state === 'success' && plan && (
          <>
            {qualityReport && <QualityBadge report={qualityReport} onRegenerate={handleRetry} />}
            <PlanViewer plan={plan} />
          </>
        )}
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

function QualityBadge({
  report,
  onRegenerate
}: {
  report: QualityReport;
  onRegenerate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const getBadgeConfig = () => {
    switch (report.finalStatus) {
      case 'passed':
        return {
          icon: '✓',
          label: 'Quality Validated',
          bgClass: 'bg-emerald-500/10 border-emerald-500/30',
          textClass: 'text-emerald-400',
          showDetails: false
        };
      case 'passed_with_issues':
        const issueCount = report.retryAttempts.length > 0
          ? report.retryAttempts[report.retryAttempts.length - 1].issues.length
          : report.firstAttempt.issues.length;
        return {
          icon: '⚠',
          label: `${issueCount} minor issue${issueCount !== 1 ? 's' : ''} detected`,
          bgClass: 'bg-amber-500/10 border-amber-500/30',
          textClass: 'text-amber-400',
          showDetails: true
        };
      case 'failed_but_returned':
        return {
          icon: '✗',
          label: 'Quality issues - consider regenerating',
          bgClass: 'bg-red-500/10 border-red-500/30',
          textClass: 'text-red-400',
          showDetails: true
        };
    }
  };

  const config = getBadgeConfig();

  const getAllIssues = () => {
    const issues: string[] = [];
    if (!report.firstAttempt.valid) {
      issues.push(...report.firstAttempt.issues);
    }
    report.retryAttempts.forEach((attempt, i) => {
      if (!attempt.valid) {
        attempt.issues.forEach(issue => {
          if (!issues.includes(issue)) issues.push(issue);
        });
      }
    });
    // Return only the issues from the final attempt
    if (report.retryAttempts.length > 0) {
      return report.retryAttempts[report.retryAttempts.length - 1].issues;
    }
    return report.firstAttempt.issues;
  };

  const finalIssues = getAllIssues();

  return (
    <div className="mb-6">
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${config.bgClass} cursor-pointer transition-all hover:opacity-80`}
        onClick={() => config.showDetails && setExpanded(!expanded)}
      >
        <span className={`text-lg ${config.textClass}`}>{config.icon}</span>
        <span className={`text-sm font-medium ${config.textClass}`}>{config.label}</span>
        {config.showDetails && (
          <span className={`text-xs ${config.textClass} ml-1`}>
            {expanded ? '▼' : '▶'}
          </span>
        )}
        <span className="text-xs text-muted-foreground ml-2">
          ({report.totalAttempts} attempt{report.totalAttempts !== 1 ? 's' : ''})
        </span>
      </div>

      {expanded && finalIssues.length > 0 && (
        <div className="mt-3 p-4 rounded-lg border border-border/60 bg-muted/30 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Issues detected:</p>
          <ul className="space-y-1.5">
            {finalIssues.map((issue, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
          {report.finalStatus === 'failed_but_returned' && (
            <div className="pt-2 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={onRegenerate}>
                Regenerate Plan
              </Button>
            </div>
          )}
        </div>
      )}
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
