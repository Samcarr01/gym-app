import { ModeSelector } from '@/components/ModeSelector';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export default function StartPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="page-container flex-1 py-12 md:py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <header className="text-center space-y-4">
            <span className="section-kicker">Mission select</span>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Choose how you want to build your plan.
            </h1>
            <p className="text-muted-foreground text-lg">
              Pick a path and the AI will tailor everything to your schedule, recovery, and goals.
            </p>
          </header>

          <div className="grid gap-3 sm:grid-cols-2 text-xs text-muted-foreground">
            <div className="soft-card p-4 text-left">
              <p className="text-[0.6rem] uppercase tracking-[0.3em]">No account</p>
              <p className="mt-2 text-sm text-foreground font-semibold">Just answer and go</p>
              <p className="text-xs text-muted-foreground">Progress auto-saves.</p>
            </div>
            <div className="soft-card p-4 text-left">
              <p className="text-[0.6rem] uppercase tracking-[0.3em]">Time to finish</p>
              <p className="mt-2 text-sm text-foreground font-semibold">~3 minutes</p>
              <p className="text-xs text-muted-foreground">Fast, focused, useful.</p>
            </div>
          </div>

          <ModeSelector />

          <div className="soft-card p-5 text-center text-sm text-muted-foreground">
            Powered by AI. Tuned by Sam. Tested by the crew.
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
