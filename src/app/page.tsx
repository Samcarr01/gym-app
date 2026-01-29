import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="page-container flex-1 py-12 md:py-16">
        <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-8 text-center lg:text-left">
            <span className="section-kicker">Totally free (for now)</span>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
                Sam built a simple gym plan app so you don&apos;t stay fat.
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                It&apos;s free because Sam is paying for the API credits. Please don&apos;t be greedy or he&apos;ll
                be angry and hide under your bed. You&apos;ve been warned.
              </p>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Answer a short questionnaire and get a real training plan based on your goals,
                schedule, recovery, and equipment. Build a new plan or upgrade your current one.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start items-center">
              <Button asChild size="lg">
                <Link href="/start">Start the questionnaire</Link>
              </Button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                No accounts. No tracking. Just gains.
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground justify-center lg:justify-start">
              <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1">
                AI-powered split selection
              </span>
              <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1">
                Recovery-aware programming
              </span>
              <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1">
                Knowledge-base driven
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary/30 via-emerald-500/10 to-transparent blur-2xl animate-float" />
            <div className="glass-panel p-6 md:p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    What it does
                  </span>
                  <span className="text-xs text-primary">Live preview</span>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-2/3 rounded-full bg-primary/20 animate-pulse-soft" />
                  <div className="h-2 w-1/2 rounded-full bg-primary/10 animate-pulse-soft delay-75" />
                  <div className="h-2 w-5/6 rounded-full bg-primary/15 animate-pulse-soft delay-150" />
                </div>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>Build a personalised training plan in minutes.</p>
                  <p>Update your existing plan when life changes.</p>
                  <p>Get a split tailored to your recovery and goals.</p>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-sm font-semibold">Plan output</p>
                    <p className="text-xs text-muted-foreground">
                      Upper/Lower • 4 days • 6 exercises
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-sm font-semibold">Progression</p>
                    <p className="text-xs text-muted-foreground">
                      Wave progression + deloads
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Powered by AI. Built with equal parts science and petty threat.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-20 md:mt-28 space-y-10">
          <div className="space-y-3 text-center">
            <span className="section-kicker">Features</span>
            <h2 className="text-3xl md:text-4xl font-semibold">Everything a real training plan needs.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No cookie-cutter templates. The plan is built around your recovery, constraints, and goals.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Personalised split',
                copy: 'AI chooses the split based on your recovery capacity, schedule, and goals.'
              },
              {
                title: 'Exercise variety',
                copy: 'Favourites included, weak points addressed, and no endless copy/paste days.'
              },
              {
                title: 'Real guidance',
                copy: 'Nutrition and recovery notes are specific, actionable, and actually useful.'
              }
            ].map((item) => (
              <div key={item.title} className="soft-card p-6 space-y-3">
                <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="mt-20 md:mt-28 space-y-10">
          <div className="space-y-3 text-center">
            <span className="section-kicker">How it works</span>
            <h2 className="text-3xl md:text-4xl font-semibold">Three steps to a plan you&apos;ll follow.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Answer the questionnaire',
                copy: 'Tell us your goals, schedule, equipment, and preferences.'
              },
              {
                step: '02',
                title: 'AI builds your program',
                copy: 'We apply the knowledge base and adjust for recovery and goals.'
              },
              {
                step: '03',
                title: 'Train with confidence',
                copy: 'Export, print, or keep tweaking as life changes.'
              }
            ].map((item) => (
              <div key={item.step} className="glass-panel p-6 space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-primary">{item.step}</p>
                <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="sam" className="mt-20 md:mt-28 border-t border-border/60 pt-16">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-center">
            <div className="relative mx-auto w-full max-w-sm">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/40 via-emerald-500/10 to-transparent blur-2xl animate-float-slow" />
              <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-3 shadow-xl">
                <img
                  src="/sam-carr.png"
                  alt="Sam Carr, builder of this app"
                  className="h-[420px] w-full object-cover rounded-2xl"
                />
              </div>
            </div>

            <div className="space-y-6 text-center lg:text-left">
              <span className="section-kicker">Meet the builder</span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Sam Carr made this for his own workouts. You get it for free (for now).
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Sam built this because he was tired of stale templates and wanted a plan that listens.
                It&apos;s free while he&apos;s feeling generous — but expect a price tag in the future when
                his API bill starts to look like a mortgage.
              </p>
              <div className="soft-card p-4 text-sm text-muted-foreground">
                <p className="text-foreground font-semibold">
                  Fun fact: Sam uses this himself.
                </p>
                <p>
                  So if it gives you a brutal leg day, blame him.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start text-xs text-muted-foreground">
                <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1">
                  Future CEO of &quot;Pay Me Gym Plans&quot;
                </span>
                <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1">
                  Probably charging soon
                </span>
                <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1">
                  Built with caffeine
                </span>
              </div>
              <div className="flex justify-center lg:justify-start">
                <Button asChild variant="outline" size="lg">
                  <Link href="/start">Start training before he charges</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 md:mt-28">
          <div className="glass-panel p-8 md:p-10 text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-semibold">Ready to train like you mean it?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get a plan that actually matches your goals, recovery, and equipment. It&apos;s free until Sam
              starts charging rent for his API bill.
            </p>
            <div className="flex justify-center">
              <Button asChild size="lg">
                <Link href="/start">Generate my plan</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
