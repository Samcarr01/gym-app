import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="page-container flex-1 py-12 md:py-16">
        <section className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] items-center">
          <div className="space-y-8 text-center lg:text-left">
            <span className="section-kicker">Performance Lab</span>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
                Training plans that feel engineered, not guessed.
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Answer a guided assessment and get a plan tuned to your goals, recovery, schedule, and equipment.
              </p>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Build a new plan or upgrade your current one. No account. Auto-save on every step.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start items-center">
              <Button asChild size="lg">
                <Link href="/start">Start the assessment</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/#how">How it works</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-xs text-muted-foreground">
              <div className="soft-card p-4 text-left">
                <p className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">Quick intake</p>
                <p className="mt-2 text-sm text-foreground font-semibold">~3 minutes</p>
                <p className="text-xs text-muted-foreground">Auto-saves as you answer.</p>
              </div>
              <div className="soft-card p-4 text-left">
                <p className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">Output</p>
                <p className="mt-2 text-sm text-foreground font-semibold">Full plan + progression</p>
                <p className="text-xs text-muted-foreground">Built around your recovery.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground justify-center lg:justify-start">
              <span className="rounded-full border border-border/60 bg-muted/50 px-3 py-1">
                Recovery-aware programming
              </span>
              <span className="rounded-full border border-border/60 bg-muted/50 px-3 py-1">
                Equipment-specific exercise picks
              </span>
              <span className="rounded-full border border-border/60 bg-muted/50 px-3 py-1">
                Knowledge-base informed
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary/30 via-emerald-400/10 to-transparent blur-3xl animate-float" />
            <div className="glass-panel p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Mission console
                </span>
                <span className="text-xs text-primary">Live build</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Goal + timeline', status: 'locked' },
                  { label: 'Recovery + availability', status: 'scanning' },
                  { label: 'Equipment constraints', status: 'queued' },
                  { label: 'Preferences + weak points', status: 'queued' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/60 p-4 space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Plan preview</p>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Split</span>
                    <span className="font-semibold text-foreground">Upper / Lower</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Frequency</span>
                    <span className="font-semibold text-foreground">4 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-semibold text-foreground">Wave + deload</span>
                  </div>
                </div>
              </div>
              <div className="soft-card p-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="uppercase tracking-[0.25em]">Signal quality</span>
                <span className="text-primary font-semibold">High</span>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-20 md:mt-28 space-y-10">
          <div className="space-y-3 text-center">
            <span className="section-kicker">Capabilities</span>
            <h2 className="text-3xl md:text-4xl font-semibold">Built like a real coach would build it.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The plan adapts to the signals you give it. More detail equals more precision.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: 'Split selection that fits life',
                copy: 'Your schedule, recovery, and goal decide the split. Not random templates.'
              },
              {
                title: 'Equipment-aware exercise choices',
                copy: 'No machines you do not have, no nonsense you do not want.'
              },
              {
                title: 'Progression you can track',
                copy: 'Clear progression model and deload logic so you actually improve.'
              },
              {
                title: 'Recovery and nutrition cues',
                copy: 'Simple, actionable guidance built around your reality.'
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
            <span className="section-kicker">Mission flow</span>
            <h2 className="text-3xl md:text-4xl font-semibold">Three stages from intake to plan.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Answer the assessment',
                copy: 'Share your goals, schedule, and constraints in a guided flow.'
              },
              {
                step: '02',
                title: 'AI builds the program',
                copy: 'Signals get turned into split, exercise, and progression choices.'
              },
              {
                step: '03',
                title: 'Train with clarity',
                copy: 'Export the plan or keep tuning it as your life changes.'
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
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/35 via-emerald-400/10 to-transparent blur-3xl animate-float-slow" />
              <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-3 shadow-xl">
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
                Sam built this for his own training. You get the lab access.
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto lg:mx-0">
                He got tired of generic spreadsheets. Now the plan adapts to recovery, schedule, and equipment. It is
                free while the API bill is tolerable.
              </p>
              <div className="soft-card p-4 text-sm text-muted-foreground">
                <p className="text-foreground font-semibold">Fun fact: Sam uses this weekly.</p>
                <p>So if it gives you a brutal leg day, blame the builder.</p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start text-xs text-muted-foreground">
                <span className="rounded-full border border-border/60 bg-muted/50 px-3 py-1">
                  Built in the garage
                </span>
                <span className="rounded-full border border-border/60 bg-muted/50 px-3 py-1">
                  Powered by GPT
                </span>
                <span className="rounded-full border border-border/60 bg-muted/50 px-3 py-1">
                  Future paid feature
                </span>
              </div>
              <div className="flex justify-center lg:justify-start">
                <Button asChild variant="outline" size="lg">
                  <Link href="/start">Start before he charges</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 md:mt-28">
          <div className="glass-panel p-8 md:p-10 text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-semibold">Ready to train with intent?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get a plan that actually matches your goals, recovery, and equipment. Fast to fill in. Easy to follow.
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
