'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuestionnaireForm } from '@/components/QuestionnaireForm';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

function QuestionnaireContent() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get('mode') as 'new' | 'update') || 'new';

  return (
    <main className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="page-container flex-1 py-12 md:py-16">
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="space-y-4">
            <span className="section-kicker">Mission intake</span>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
              Give the AI your training signals.
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              Answer a focused set of questions so the plan matches your goals, recovery, equipment, and preferences.
            </p>
          </header>

          <div className="lg:hidden grid gap-3 text-sm">
            <div className="soft-card p-4 flex items-center justify-between">
              <span className="text-muted-foreground">Time to finish</span>
              <span className="font-semibold">~3 min</span>
            </div>
            <div className="soft-card p-4 flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="text-primary font-semibold">Auto-save on</span>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <QuestionnaireForm mode={mode} />

            <aside className="hidden lg:block space-y-6">
              <div className="glass-panel p-6 space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Mission console</p>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Signal quality</span>
                    <span className="text-primary font-semibold">High</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Estimated time</span>
                    <span className="font-semibold text-foreground">~3 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Auto-save</span>
                    <span className="font-semibold text-foreground">Enabled</span>
                  </div>
                </div>
              </div>
              <div className="soft-card p-6 space-y-4">
                <h2 className="font-display text-lg font-semibold">What gets personalised</h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Split + weekly structure</li>
                  <li>• Exercise selection (favourites + weak points)</li>
                  <li>• Volume, intensity, and progression model</li>
                  <li>• Recovery and nutrition guidance</li>
                </ul>
              </div>
              <div className="soft-card p-6 space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tip</p>
                <p className="text-sm text-muted-foreground">
                  Be honest about recovery and time. The plan will be better and easier to follow.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Loading your questionnaire...
        </div>
      }
    >
      <QuestionnaireContent />
    </Suspense>
  );
}
