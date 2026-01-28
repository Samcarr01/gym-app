'use client';

import { useState } from 'react';
import { WorkoutDay as WorkoutDayType } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface WorkoutDayProps {
  day: WorkoutDayType;
}

export function WorkoutDay({ day }: WorkoutDayProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-primary">
            Day {day.dayNumber}
          </span>
          <div className="text-left">
            <h3 className="font-semibold">{day.name}</h3>
            <p className="text-sm text-muted-foreground">{day.focus}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{day.duration}</Badge>
          <Badge variant="secondary">{day.exercises.length} exercises</Badge>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Content - Collapsible */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-4 border-t">
          {/* Warm-up */}
          <div className="pt-4">
            <h4 className="font-medium text-sm text-primary mb-2">🔥 Warm-up</h4>
            <p className="text-sm text-muted-foreground mb-2">{day.warmup.description}</p>
            <ul className="text-sm space-y-1">
              {day.warmup.exercises.map((exercise, idx) => (
                <li key={idx} className="text-muted-foreground">• {exercise}</li>
              ))}
            </ul>
          </div>

          {/* Exercises */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-primary">💪 Exercises</h4>
            {day.exercises.map((exercise, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-muted/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">{exercise.name}</h5>
                  <span className="text-sm font-mono bg-background px-2 py-1 rounded">
                    {exercise.sets} × {exercise.reps}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>⏱️ Rest: {exercise.rest}</p>
                  <p className="italic">"{exercise.intent}"</p>
                  {exercise.notes && (
                    <p className="text-primary/80">💡 {exercise.notes}</p>
                  )}
                </div>
                {exercise.substitutions.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    🔄 Alternatives: {exercise.substitutions.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Cool-down */}
          <div>
            <h4 className="font-medium text-sm text-primary mb-2">❄️ Cool-down</h4>
            <p className="text-sm text-muted-foreground mb-2">{day.cooldown.description}</p>
            <ul className="text-sm space-y-1">
              {day.cooldown.exercises.map((exercise, idx) => (
                <li key={idx} className="text-muted-foreground">• {exercise}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
