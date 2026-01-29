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
            <span className="section-kicker">Choose your path</span>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Build a brand-new plan or upgrade an existing one.
            </h1>
            <p className="text-muted-foreground text-lg">
              Pick a mode and the AI will tailor everything to your schedule, goals, and recovery.
            </p>
          </header>

          <ModeSelector />

          <div className="soft-card p-5 text-center text-sm text-muted-foreground">
            Powered by AI. Tuned by Sam. Tested by your mates.
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
