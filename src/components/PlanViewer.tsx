'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GeneratedPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkoutDay } from '@/components/WorkoutDay';
import { Copy, Check, Printer, RotateCcw } from 'lucide-react';

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
      <header className="space-y-4">
        <h1 className="text-3xl font-bold">{plan.planName}</h1>
        <p className="text-muted-foreground text-lg">{plan.overview}</p>
        <Badge variant="secondary" className="text-sm">
          {plan.weeklyStructure}
        </Badge>
      </header>

      {/* Actions */}
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

      {/* Workout Days */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Workouts</h2>
        {plan.days.map((day) => (
          <WorkoutDay key={day.dayNumber} day={day} />
        ))}
      </div>

      {/* Additional Notes */}
      <div className="grid gap-6 md:grid-cols-3 print:grid-cols-3">
        <Card className="p-4">
          <h3 className="font-semibold mb-2 text-primary">📈 Progression</h3>
          <p className="text-sm text-muted-foreground">
            {plan.progressionGuidance}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2 text-primary">🥗 Nutrition</h3>
          <p className="text-sm text-muted-foreground">
            {plan.nutritionNotes}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2 text-primary">😴 Recovery</h3>
          <p className="text-sm text-muted-foreground">
            {plan.recoveryNotes}
          </p>
        </Card>
      </div>

      {/* Disclaimer */}
      <footer className="pt-6 border-t">
        <p className="text-xs text-muted-foreground text-center">
          ⚠️ {plan.disclaimer}
        </p>
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
