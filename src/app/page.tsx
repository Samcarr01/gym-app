export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_50%),radial-gradient(circle_at_20%_40%,_rgba(16,185,129,0.12),_transparent_45%),radial-gradient(circle_at_80%_20%,_rgba(59,130,246,0.12),_transparent_40%)]" />
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float-slow" />
      <div className="absolute right-10 top-10 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl animate-float" />
      <div className="absolute bottom-10 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-400/10 blur-[120px] animate-pulse-soft" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-primary">
              Totally free (for now)
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                Sam&apos;s built a simple gym plan app so you don&apos;t stay fat.
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
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <a
                href="/start"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-[1.02] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full sm:w-auto"
              >
                Start the questionnaire
              </a>
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
            <div className="relative rounded-3xl border border-border/60 bg-card/70 p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
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
        </div>
      </div>
    </main>
  );
}
