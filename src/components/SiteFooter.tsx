import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-background/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="font-display text-lg font-semibold">Sam&apos;s Plan Lab</p>
          <p className="text-sm text-muted-foreground">
            Free while Sam is burning his API credits.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <Link href="/start" className="transition hover:text-foreground">
            Start
          </Link>
          <Link href="/#features" className="transition hover:text-foreground">
            Features
          </Link>
          <Link href="/#how" className="transition hover:text-foreground">
            How it works
          </Link>
          <Link href="/#sam" className="transition hover:text-foreground">
            Sam
          </Link>
        </div>
      </div>
    </footer>
  );
}
