'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionnaireData } from '@/lib/types';

export function ConstraintsStep() {
  const { register } = useFormContext<QuestionnaireData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Constraints & Notes</CardTitle>
        <CardDescription>Any additional constraints or information we should know?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="maxExercisesPerSession">Max Exercises Per Session (Optional)</Label>
          <Input
            id="maxExercisesPerSession"
            type="number"
            min={1}
            max={20}
            placeholder="e.g., 6"
            {...register('constraints.maxExercisesPerSession', {
              setValueAs: (value) => value === '' ? null : parseInt(value)
            })}
          />
          <p className="text-xs text-muted-foreground">
            Limit the number of exercises per workout
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeConstraints">Time Constraints (Optional)</Label>
          <Textarea
            id="timeConstraints"
            placeholder="e.g., Can only train early morning, need to finish by 7am"
            {...register('constraints.timeConstraints')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="otherNotes">Other Notes (Optional)</Label>
          <Textarea
            id="otherNotes"
            placeholder="Anything else we should consider when building your plan..."
            {...register('constraints.otherNotes')}
          />
          <p className="text-xs text-muted-foreground">
            Any other preferences, goals, or constraints
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
