'use client';

import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ExistingPlanStepProps {
  value: string;
  onChange: (value: string) => void;
}

export function ExistingPlanStep({ value, onChange }: ExistingPlanStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Existing Plan</CardTitle>
        <CardDescription>
          Paste your current workout plan below. The AI will use this as a reference when creating your updated plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your current workout plan here...

Example:
Day 1 - Push
- Bench Press 4x8
- Overhead Press 3x10
- Incline Dumbbell Press 3x12
..."
          className="min-h-[300px] font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Include exercises, sets, reps, and any notes about what's working or not working
        </p>
      </CardContent>
    </Card>
  );
}
