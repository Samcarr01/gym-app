'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, PlusCircle, RefreshCw } from 'lucide-react';

interface ModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  tag: string;
  meta: string;
}

function ModeCard({ title, description, icon, href, tag, meta }: ModeCardProps) {
  return (
    <Link href={href} className="block h-full">
      <Card className="group relative h-full overflow-hidden p-6 transition-all hover:border-primary/50 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                {icon}
              </div>
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">{tag}</p>
                <h2 className="font-display font-semibold text-lg">{title}</h2>
              </div>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{meta}</span>
          </div>

          <p className="text-muted-foreground text-sm mt-4 leading-relaxed">{description}</p>

          <div className="mt-auto pt-6 flex items-center justify-between text-sm">
            <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">~3 min</span>
            <span className="inline-flex items-center gap-2 text-primary font-semibold">
              Continue <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function ModeSelector() {
  return (
    <div className="grid gap-4 md:grid-cols-2 items-stretch">
      <ModeCard
        title="Build New Plan"
        description="Start fresh with a full assessment to create a personalised workout plan built around your goals."
        icon={<PlusCircle className="h-6 w-6" />}
        href="/questionnaire?mode=new"
        tag="Mission 01"
        meta="Full build"
      />
      <ModeCard
        title="Update Existing Plan"
        description="Paste your current program and adjust the plan based on new goals, time, or limitations."
        icon={<RefreshCw className="h-6 w-6" />}
        href="/questionnaire?mode=update"
        tag="Mission 02"
        meta="Quick refit"
      />
    </div>
  );
}
