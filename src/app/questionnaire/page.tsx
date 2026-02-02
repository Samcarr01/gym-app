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
            <span className="section-kicker">Questionnaire</span>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
              Tell the AI about your training world.
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              The more detail you share, the more specific the plan becomes. We&apos;ll use your goals,
              recovery, equipment, and preferences to build something worth doing.
            </p>
          </header>

          {/* Mobile info banner - shows on small screens only */}
          <div className="lg:hidden flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-4 py-2">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">~3 min</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-muted-foreground">Auto-saves progress</span>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <QuestionnaireForm mode={mode} />
            {/* Sidebar - hidden on mobile, visible on large screens */}
            <aside className="hidden lg:block space-y-6">
              <div className="soft-card p-6 space-y-4">
                <h2 className="font-display text-lg font-semibold">What gets personalised</h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Training split + weekly structure</li>
                  <li>• Exercise selection (favourites + weak points)</li>
                  <li>• Volume, intensity, and progression model</li>
                  <li>• Recovery &amp; nutrition guidance that matches your lifestyle</li>
                </ul>
              </div>
              <div className="glass-panel p-6 space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Time to complete</p>
                <p className="text-2xl font-semibold">~3 minutes</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll save your progress automatically while you move through the steps.
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
