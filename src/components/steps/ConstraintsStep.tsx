'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
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
        <FormField
          label="Max Exercises Per Session (Optional)"
          htmlFor="maxExercisesPerSession"
          description="Limit the number of exercises per workout"
        >
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
        </FormField>

        <FormField
          label="Time Constraints (Optional)"
          htmlFor="timeConstraints"
        >
          <Textarea
            id="timeConstraints"
            placeholder="e.g., Can only train early morning, need to finish by 7am"
            {...register('constraints.timeConstraints')}
          />
        </FormField>

        <FormField
          label="Other Notes (Optional)"
          htmlFor="otherNotes"
          description="Any other preferences, goals, or constraints"
        >
          <Textarea
            id="otherNotes"
            placeholder="Anything else we should consider when building your plan..."
            {...register('constraints.otherNotes')}
          />
        </FormField>
      </CardContent>
    </Card>
  );
}
