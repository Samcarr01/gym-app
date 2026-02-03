'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GeneratedPlan, QuestionnaireData } from '@/lib/types';
import { generatePlanStream, QualityReport } from '@/lib/api';
import { PlanViewer } from '@/components/PlanViewer';
import { PlanComparison } from '@/components/PlanComparison';
import { PlanEditor } from '@/components/PlanEditor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

type PageState = 'loading' | 'success' | 'error';

export default function GeneratePage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>('loading');
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [existingPlanText, setExistingPlanText] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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

        // Store existing plan for comparison view
        if (existingPlan) {
          setExistingPlanText(existingPlan);
        }

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
    <main className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="page-container flex-1 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
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
              {!isEditing && qualityReport && <QualityBadge report={qualityReport} onRegenerate={handleRetry} />}

              {!isEditing && (
                <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
                  {existingPlanText && (
                    <>
                      <Button
                        variant={showComparison ? 'outline' : 'default'}
                        onClick={() => setShowComparison(false)}
                        size="sm"
                      >
                        View New Plan
                      </Button>
                      <Button
                        variant={showComparison ? 'default' : 'outline'}
                        onClick={() => setShowComparison(true)}
                        size="sm"
                      >
                        Compare Changes
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    size="sm"
                  >
                    Edit Plan
                  </Button>
                </div>
              )}

              {isEditing ? (
                <PlanEditor
                  plan={plan}
                  onSave={(editedPlan) => {
                    setPlan(editedPlan);
                    setIsEditing(false);
                  }}
                  onCancel={() => setIsEditing(false)}
                />
              ) : showComparison && existingPlanText ? (
                <PlanComparison oldPlanText={existingPlanText} newPlan={plan} />
              ) : (
                <PlanViewer plan={plan} />
              )}
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
      </div>
      <SiteFooter />
    </main>
  );
}

const FITNESS_TIPS = [
  { tip: "Progressive overload is the key to growth", detail: "Gradually increase weight, reps, or sets over time" },
  { tip: "Sleep is when muscles actually grow", detail: "Aim for 7-9 hours of quality sleep per night" },
  { tip: "Compound movements build the most strength", detail: "Squats, deadlifts, bench press, and rows should be staples" },
  { tip: "Protein timing matters less than total intake", detail: "Focus on hitting your daily protein goal first" },
  { tip: "Deload weeks prevent burnout and injury", detail: "Every 4-6 weeks, reduce volume by 30-50%" },
  { tip: "Mind-muscle connection improves results", detail: "Focus on the muscle working, not just moving weight" },
  { tip: "Consistency beats perfection every time", detail: "A good plan you follow beats a perfect plan you don't" },
  { tip: "Warm-up sets prevent injuries", detail: "Start with lighter weights before your working sets" },
  { tip: "Track your workouts to ensure progress", detail: "What gets measured gets managed" },
  { tip: "Recovery is part of the training process", detail: "Your muscles grow during rest, not during the workout" },
  { tip: "Hydration affects performance significantly", detail: "Even 2% dehydration can reduce strength by 10%" },
  { tip: "Form always comes before weight", detail: "Master the movement pattern before adding load" },
];

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
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % FITNESS_TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentTip = FITNESS_TIPS[tipIndex];
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
      <div className="relative w-full max-w-3xl">
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-emerald-400/5 to-transparent blur-3xl" />
        <div className="relative glass-panel p-8 md:p-10 space-y-8 animate-rise">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(hsl(var(--primary)) ${clampedProgress}%, hsl(var(--border)) ${clampedProgress}%)`
                  }}
                />
                <div className="absolute inset-1 rounded-full bg-background/90 flex items-center justify-center text-sm font-semibold">
                  {Math.round(clampedProgress)}%
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Build pipeline</p>
                <h2 className="text-2xl font-semibold tracking-tight">Assembling your plan</h2>
                <p className="text-sm text-muted-foreground">{statusMessage}</p>
              </div>
            </div>
            <div className="soft-card px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Elapsed {elapsedSeconds}s
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="relative h-2 rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary/60 via-primary to-emerald-400/70 transition-all duration-700"
                  style={{ width: `${clampedProgress}%` }}
                />
                <div className="absolute inset-0 animate-scan bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)]" />
              </div>
              <div className="grid gap-3">
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
                      {isActive && (
                        <span className="text-xs uppercase tracking-[0.2em] text-primary">Live</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="soft-card p-5 space-y-3 text-sm text-muted-foreground">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Signal analysis</p>
              <p>Applying your goals, targets, and recovery inputs to choose the split and volume.</p>
              <p>Injecting the knowledge base and refining the plan for your constraints.</p>
              <p className="text-primary/80">This stays live until the plan is ready.</p>
            </div>
          </div>

          <div className="soft-card p-5 space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Coach cue</p>
            <p className="text-sm font-semibold text-foreground transition-opacity duration-300">
              {currentTip.tip}
            </p>
            <p className="text-xs text-muted-foreground transition-opacity duration-300">
              {currentTip.detail}
            </p>
            <div className="flex gap-1 justify-center">
              {FITNESS_TIPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 w-2 rounded-full transition-colors ${
                    i === tipIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
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
          label: 'Quality validated',
          bgClass: 'bg-emerald-500/10 border-emerald-500/30',
          textClass: 'text-emerald-400',
          dotClass: 'bg-emerald-400',
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
          dotClass: 'bg-amber-400',
          showDetails: true
        };
      case 'failed_but_returned':
        return {
          icon: '✗',
          label: 'Quality issues detected',
          bgClass: 'bg-red-500/10 border-red-500/30',
          textClass: 'text-red-400',
          dotClass: 'bg-red-400',
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
    report.retryAttempts.forEach((attempt) => {
      if (!attempt.valid) {
        attempt.issues.forEach(issue => {
          if (!issues.includes(issue)) issues.push(issue);
        });
      }
    });
    if (report.retryAttempts.length > 0) {
      return report.retryAttempts[report.retryAttempts.length - 1].issues;
    }
    return report.firstAttempt.issues;
  };

  const finalIssues = getAllIssues();

  return (
    <div className="mb-6 flex flex-col items-center gap-3">
      <button
        type="button"
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${config.bgClass} transition-all hover:opacity-80`}
        onClick={() => config.showDetails && setExpanded(!expanded)}
        disabled={!config.showDetails}
      >
        <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
        <span className={`text-xs uppercase tracking-[0.25em] ${config.textClass}`}>
          {config.label}
        </span>
        <span className="text-xs text-muted-foreground ml-2">
          ({report.totalAttempts} attempt{report.totalAttempts !== 1 ? 's' : ''})
        </span>
        {config.showDetails && (
          <span className={`text-xs ${config.textClass} ml-1`}>
            {expanded ? '▼' : '▶'}
          </span>
        )}
      </button>

      {expanded && finalIssues.length > 0 && (
        <div className="w-full max-w-3xl glass-panel p-5 space-y-3 animate-rise">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Issues detected</p>
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
      <Card className="p-8 max-w-md text-center space-y-4 animate-rise">
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
