'use client';

import { useState } from 'react';
import { WorkoutDay as WorkoutDayType } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Dumbbell, Clock, Target, Lightbulb, TrendingUp, RefreshCw, Flame, Snowflake } from 'lucide-react';

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
        className="w-full p-4 md:p-5 flex items-center justify-between hover:bg-muted/40 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
            <span className="text-xl font-semibold text-primary">
              {day.dayNumber}
            </span>
          </div>
          <div className="text-left">
            <h3 className="font-display font-semibold text-base md:text-lg">{day.name}</h3>
            <p className="text-sm text-muted-foreground">{day.focus}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Badge variant="outline" className="hidden md:flex tracking-normal normal-case">
            <Clock className="h-3 w-3 mr-1" />
            {day.duration}
          </Badge>
          <Badge variant="secondary" className="tracking-normal normal-case">
            <Dumbbell className="h-3 w-3 mr-1" />
            {day.exercises.length}
          </Badge>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </div>
      </button>

      {/* Content - Collapsible */}
      {isOpen && (
        <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-5 border-t border-border/50">
          {/* Warm-up */}
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="h-4 w-4 text-orange-500" />
              <h4 className="font-medium text-sm">Warm-up</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{day.warmup.description}</p>
            <ul className="text-sm space-y-1">
              {day.warmup.exercises.map((exercise, idx) => (
                <li key={idx} className="text-muted-foreground flex items-start gap-2">
                  <span className="text-orange-500/70">•</span>
                  {exercise}
                </li>
              ))}
            </ul>
          </div>

          {/* Exercises */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-sm">Exercises</h4>
            </div>
            {day.exercises.map((exercise, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/40 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                      {idx + 1}
                    </span>
                    <h5 className="font-medium">{exercise.name}</h5>
                  </div>
                  <Badge variant="secondary" className="font-mono text-sm flex-shrink-0 tracking-normal normal-case">
                    {exercise.sets} x {exercise.reps}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Rest: {exercise.rest}</span>
                  </div>
                </div>
                <div className="text-sm space-y-2 pt-1">
                  <p className="italic text-muted-foreground">"{exercise.intent}"</p>
                  {exercise.rationale && exercise.rationale !== exercise.intent && (
                    <div className="flex items-start gap-2 text-primary/90">
                      <Target className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{exercise.rationale}</span>
                    </div>
                  )}
                  {exercise.notes && (
                    <div className="flex items-start gap-2 text-primary/80">
                      <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{exercise.notes}</span>
                    </div>
                  )}
                  {exercise.progressionNote && (
                    <div className="flex items-start gap-2 text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{exercise.progressionNote.replace(/^📈\s*/, '')}</span>
                    </div>
                  )}
                </div>
                {exercise.substitutions.length > 0 && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
                    <RefreshCw className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span>Alternatives: {exercise.substitutions.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Cool-down */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Snowflake className="h-4 w-4 text-blue-500" />
              <h4 className="font-medium text-sm">Cool-down</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{day.cooldown.description}</p>
            <ul className="text-sm space-y-1">
              {day.cooldown.exercises.map((exercise, idx) => (
                <li key={idx} className="text-muted-foreground flex items-start gap-2">
                  <span className="text-blue-500/70">•</span>
                  {exercise}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
