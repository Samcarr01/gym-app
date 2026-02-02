import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary font-semibold">
            SG
          </div>
          <div className="leading-tight">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Sam&apos;s Gym
            </p>
            <p className="font-display text-lg font-semibold">Plan Lab</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/#features" className="transition hover:text-foreground">
            Features
          </Link>
          <Link href="/#how" className="transition hover:text-foreground">
            How it works
          </Link>
          <Link href="/#sam" className="transition hover:text-foreground">
            Built by Sam
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary md:inline-flex">
            Free beta
          </span>
          <ThemeToggle />
          <Button asChild size="sm">
            <Link href="/start">Start now</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
