'use client';

import { useState } from 'react';
import { GeneratedPlan } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeftRight, ChevronDown, ChevronUp, Plus, Minus, Equal } from 'lucide-react';

interface PlanComparisonProps {
  oldPlanText: string;
  newPlan: GeneratedPlan;
}

// Parse basic structure from plan text
function parseOldPlan(text: string): { days: Array<{ name: string; exercises: string[] }> } {
  const days: Array<{ name: string; exercises: string[] }> = [];
  const lines = text.split('\n');

  let currentDay: { name: string; exercises: string[] } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Look for day markers
    const dayMatch = trimmed.match(/^(?:DAY\s*\d+:?\s*|Day\s*\d+:?\s*)(.+)/i);
    if (dayMatch) {
      if (currentDay) days.push(currentDay);
      currentDay = { name: dayMatch[1].trim(), exercises: [] };
      continue;
    }

    // Look for exercise names (lines that start with - or • or numbers)
    if (currentDay && trimmed.match(/^[-•\d.]\s*.+/)) {
      const exerciseName = trimmed
        .replace(/^[-•\d.]+\s*/, '')
        .replace(/:\s*\d+x\d+.*$/, '') // Remove sets x reps
        .replace(/\s*-\s*\d+\s*(sets?|reps?).*$/i, '')
        .trim();

      if (exerciseName && exerciseName.length > 2 && exerciseName.length < 50) {
        currentDay.exercises.push(exerciseName);
      }
    }
  }

  if (currentDay) days.push(currentDay);
  return { days };
}

export function PlanComparison({ oldPlanText, newPlan }: PlanComparisonProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]));
  const oldPlan = parseOldPlan(oldPlanText);

  const toggleDay = (index: number) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Create a set of old exercises for comparison
  const oldExercises = new Set(
    oldPlan.days.flatMap(d => d.exercises.map(e => e.toLowerCase()))
  );

  const getExerciseStatus = (exerciseName: string): 'new' | 'same' | 'removed' => {
    const lower = exerciseName.toLowerCase();
    // Check if any old exercise contains or is contained in the new exercise name
    const isInOld = Array.from(oldExercises).some(
      old => old.includes(lower) || lower.includes(old)
    );
    return isInOld ? 'same' : 'new';
  };

  // Count changes
  const newExerciseCount = newPlan.days.reduce((count, day) => {
    return count + day.exercises.filter(ex => getExerciseStatus(ex.name) === 'new').length;
  }, 0);

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Plan Comparison</h3>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Plus className="h-3 w-3" />
            {newExerciseCount} new exercises
          </Badge>
          <Badge variant="secondary">{newPlan.days.length} days</Badge>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Your updated plan based on your feedback. New exercises are highlighted.
      </p>

      <div className="space-y-3">
        {newPlan.days.map((day, dayIndex) => {
          const isExpanded = expandedDays.has(dayIndex);
          const oldDay = oldPlan.days[dayIndex];

          return (
            <div key={dayIndex} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleDay(dayIndex)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {dayIndex + 1}
                  </span>
                  <div className="text-left">
                    <p className="font-medium">{day.name}</p>
                    <p className="text-xs text-muted-foreground">{day.exercises.length} exercises</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 grid md:grid-cols-2 gap-4">
                  {/* Old Plan Column */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Previous Plan</p>
                    {oldDay ? (
                      <ul className="space-y-1.5">
                        {oldDay.exercises.map((ex, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <Equal className="h-3 w-3 flex-shrink-0 opacity-50" />
                            {ex}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">New day added</p>
                    )}
                  </div>

                  {/* New Plan Column */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-primary uppercase tracking-wide">Updated Plan</p>
                    <ul className="space-y-1.5">
                      {day.exercises.map((ex, i) => {
                        const status = getExerciseStatus(ex.name);
                        return (
                          <li
                            key={i}
                            className={`text-sm flex items-center gap-2 ${
                              status === 'new' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''
                            }`}
                          >
                            {status === 'new' ? (
                              <Plus className="h-3 w-3 flex-shrink-0" />
                            ) : (
                              <Equal className="h-3 w-3 flex-shrink-0 opacity-50" />
                            )}
                            {ex.name}
                            {status === 'new' && (
                              <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0">New</Badge>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (expandedDays.size === newPlan.days.length) {
            setExpandedDays(new Set());
          } else {
            setExpandedDays(new Set(newPlan.days.map((_, i) => i)));
          }
        }}
      >
        {expandedDays.size === newPlan.days.length ? 'Collapse All' : 'Expand All'}
      </Button>
    </Card>
  );
}
