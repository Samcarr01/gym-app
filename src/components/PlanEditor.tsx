'use client';

import { useState } from 'react';
import { GeneratedPlan, Exercise, WorkoutDay } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Edit3, Save, X, Plus, Trash2, ChevronUp, ChevronDown,
  GripVertical, Check
} from 'lucide-react';

interface PlanEditorProps {
  plan: GeneratedPlan;
  onSave: (plan: GeneratedPlan) => void;
  onCancel: () => void;
}

export function PlanEditor({ plan, onSave, onCancel }: PlanEditorProps) {
  const [editedPlan, setEditedPlan] = useState<GeneratedPlan>(() =>
    JSON.parse(JSON.stringify(plan)) // Deep clone
  );
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  const updateDay = (dayIndex: number, updates: Partial<WorkoutDay>) => {
    setEditedPlan(prev => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === dayIndex ? { ...day, ...updates } : day
      )
    }));
  };

  const updateExercise = (dayIndex: number, exerciseIndex: number, updates: Partial<Exercise>) => {
    setEditedPlan(prev => ({
      ...prev,
      days: prev.days.map((day, di) =>
        di === dayIndex ? {
          ...day,
          exercises: day.exercises.map((ex, ei) =>
            ei === exerciseIndex ? { ...ex, ...updates } : ex
          )
        } : day
      )
    }));
  };

  const addExercise = (dayIndex: number) => {
    const newExercise: Exercise = {
      name: 'New Exercise',
      sets: 3,
      reps: '8-12',
      rest: '90 seconds',
      intent: '',
      rationale: '',
      notes: '',
      substitutions: [],
      progressionNote: ''
    };

    setEditedPlan(prev => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === dayIndex ? {
          ...day,
          exercises: [...day.exercises, newExercise]
        } : day
      )
    }));
  };

  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    setEditedPlan(prev => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === dayIndex ? {
          ...day,
          exercises: day.exercises.filter((_, ei) => ei !== exerciseIndex)
        } : day
      )
    }));
  };

  const moveExercise = (dayIndex: number, exerciseIndex: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? exerciseIndex - 1 : exerciseIndex + 1;

    setEditedPlan(prev => {
      const day = prev.days[dayIndex];
      if (newIndex < 0 || newIndex >= day.exercises.length) return prev;

      const newExercises = [...day.exercises];
      [newExercises[exerciseIndex], newExercises[newIndex]] =
        [newExercises[newIndex], newExercises[exerciseIndex]];

      return {
        ...prev,
        days: prev.days.map((d, i) =>
          i === dayIndex ? { ...d, exercises: newExercises } : d
        )
      };
    });
  };

  const handleSave = () => {
    onSave(editedPlan);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Edit3 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Edit Plan</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Plan Name */}
      <Card className="p-4">
        <label className="text-sm font-medium text-muted-foreground">Plan Name</label>
        <Input
          value={editedPlan.planName}
          onChange={(e) => setEditedPlan(prev => ({ ...prev, planName: e.target.value }))}
          className="mt-1"
        />
      </Card>

      {/* Days */}
      <div className="space-y-3">
        {editedPlan.days.map((day, dayIndex) => (
          <Card key={dayIndex} className="overflow-hidden">
            {/* Day Header */}
            <button
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedDay(expandedDay === dayIndex ? null : dayIndex)}
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
              <Badge variant="outline">{expandedDay === dayIndex ? 'Collapse' : 'Edit'}</Badge>
            </button>

            {/* Day Content */}
            {expandedDay === dayIndex && (
              <div className="p-4 pt-0 space-y-4 border-t">
                {/* Day Name Edit */}
                <div className="flex gap-2">
                  <Input
                    value={day.name}
                    onChange={(e) => updateDay(dayIndex, { name: e.target.value })}
                    placeholder="Day name"
                    className="flex-1"
                  />
                  <Input
                    value={day.focus}
                    onChange={(e) => updateDay(dayIndex, { focus: e.target.value })}
                    placeholder="Focus area"
                    className="flex-1"
                  />
                </div>

                {/* Exercises */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Exercises</p>
                  {day.exercises.map((exercise, exerciseIndex) => (
                    <div
                      key={exerciseIndex}
                      className="p-3 bg-muted/30 rounded-lg border border-border/50 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                        <Input
                          value={exercise.name}
                          onChange={(e) => updateExercise(dayIndex, exerciseIndex, { name: e.target.value })}
                          className="flex-1"
                          placeholder="Exercise name"
                        />
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveExercise(dayIndex, exerciseIndex, 'up')}
                            disabled={exerciseIndex === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveExercise(dayIndex, exerciseIndex, 'down')}
                            disabled={exerciseIndex === day.exercises.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => removeExercise(dayIndex, exerciseIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2 pl-6">
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground">Sets</label>
                          <Input
                            type="number"
                            value={exercise.sets}
                            onChange={(e) => updateExercise(dayIndex, exerciseIndex, { sets: parseInt(e.target.value) || 3 })}
                            className="h-8"
                            min={1}
                            max={10}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground">Reps</label>
                          <Input
                            value={exercise.reps}
                            onChange={(e) => updateExercise(dayIndex, exerciseIndex, { reps: e.target.value })}
                            className="h-8"
                            placeholder="8-12"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground">Rest</label>
                          <Input
                            value={exercise.rest}
                            onChange={(e) => updateExercise(dayIndex, exerciseIndex, { rest: e.target.value })}
                            className="h-8"
                            placeholder="90 seconds"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addExercise(dayIndex)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exercise
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Check className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
