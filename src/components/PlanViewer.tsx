'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GeneratedPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkoutDay } from '@/components/WorkoutDay';
import { Copy, Check, Printer, RotateCcw, TrendingUp, Utensils, Moon, AlertTriangle } from 'lucide-react';

interface PlanViewerProps {
  plan: GeneratedPlan;
}

export function PlanViewer({ plan }: PlanViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = formatPlanAsText(plan);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Header */}
      <header className="glass-panel p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="border-primary/30 bg-primary/10 text-primary">Plan ready</Badge>
          <Badge variant="outline" className="tracking-normal normal-case">
            {plan.weeklyStructure}
          </Badge>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">{plan.planName}</h1>
          <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">{plan.overview}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="soft-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Frequency</p>
            <p className="text-lg font-semibold mt-2">{plan.days.length} days / week</p>
          </div>
          <div className="soft-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Session length</p>
            <p className="text-lg font-semibold mt-2">{plan.days[0]?.duration || '60 min'}</p>
          </div>
          <div className="soft-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Split</p>
            <p className="text-lg font-semibold mt-2">{plan.weeklyStructure}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 print:hidden">
          <Button onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Plan
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Over
            </Link>
          </Button>
        </div>
      </header>

      {/* Workout Days */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="section-kicker">Workouts</span>
          <h2 className="text-2xl font-semibold">Your training week</h2>
          <Badge variant="outline" className="tracking-normal normal-case">
            {plan.days.length} days
          </Badge>
        </div>
        {plan.days.map((day) => (
          <WorkoutDay key={day.dayNumber} day={day} />
        ))}
      </div>

      {/* Additional Notes */}
      <div className="grid gap-6 md:grid-cols-3 print:grid-cols-3">
        <Card className="p-5 hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-primary">Progression</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {plan.progressionGuidance}
          </p>
        </Card>
        <Card className="p-5 hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Utensils className="h-5 w-5 text-orange-500" />
            </div>
            <h3 className="font-semibold text-primary">Nutrition</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {plan.nutritionNotes}
          </p>
        </Card>
        <Card className="p-5 hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Moon className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="font-semibold text-primary">Recovery</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {plan.recoveryNotes}
          </p>
        </Card>
      </div>

      {/* Disclaimer */}
      <footer className="pt-6 border-t">
        <div className="flex items-center justify-center gap-2 p-4 bg-amber-500/5 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-muted-foreground text-center">
            {plan.disclaimer}
          </p>
        </div>
      </footer>
    </div>
  );
}

function formatPlanAsText(plan: GeneratedPlan): string {
  let text = `${plan.planName}\n${'='.repeat(plan.planName.length)}\n\n`;
  text += `${plan.overview}\n\n`;
  text += `Structure: ${plan.weeklyStructure}\n\n`;

  for (const day of plan.days) {
    text += `${'─'.repeat(40)}\n`;
    text += `DAY ${day.dayNumber}: ${day.name}\n`;
    text += `Focus: ${day.focus} | Duration: ${day.duration}\n\n`;

    text += `Warm-up: ${day.warmup.description}\n`;
    text += day.warmup.exercises.map(e => `  • ${e}`).join('\n') + '\n\n';

    text += `Exercises:\n`;
    for (const exercise of day.exercises) {
      text += `  ${exercise.name}\n`;
      text += `    Sets: ${exercise.sets} | Reps: ${exercise.reps} | Rest: ${exercise.rest}\n`;
      text += `    Purpose: ${exercise.intent}\n`;
      if (exercise.notes) text += `    Notes: ${exercise.notes}\n`;
      if (exercise.substitutions.length > 0) {
        text += `    Alternatives: ${exercise.substitutions.join(', ')}\n`;
      }
      text += '\n';
    }

    text += `Cool-down: ${day.cooldown.description}\n`;
    text += day.cooldown.exercises.map(e => `  • ${e}`).join('\n') + '\n\n';
  }

  text += `${'─'.repeat(40)}\n\n`;
  text += `PROGRESSION: ${plan.progressionGuidance}\n\n`;
  text += `NUTRITION: ${plan.nutritionNotes}\n\n`;
  text += `RECOVERY: ${plan.recoveryNotes}\n\n`;
  text += `⚠️ ${plan.disclaimer}`;

  return text;
}
