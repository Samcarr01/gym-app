'use client';

import { useFormContext } from 'react-hook-form';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Autocomplete } from '@/components/ui/autocomplete';
import { searchExercises } from '@/lib/exercise-list';
import { QuestionnaireData } from '@/lib/types';

export function PreferencesStep() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<QuestionnaireData>();

  // Watch exercise values for controlled autocomplete
  const favouriteExercise = watch('preferences.favouriteExercises.0') || '';
  const dislikedExercise = watch('preferences.dislikedExercises.0') || '';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Preferences</CardTitle>
        <CardDescription>Tell us what you enjoy so we can keep you motivated</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          label="Favorite Exercises (Optional)"
          htmlFor="favouriteExercises"
          description="List exercises you love - we'll include them in your program. Start typing to see suggestions."
        >
          <Autocomplete
            id="favouriteExercises"
            placeholder="E.g., Deadlift, Pull-ups, Squats..."
            suggestions={[]}
            onSearch={searchExercises}
            value={favouriteExercise}
            onChange={(val) => setValue('preferences.favouriteExercises.0', val)}
          />
        </FormField>

        <FormField
          label="Exercises to Avoid (Optional)"
          htmlFor="dislikedExercises"
          description="Exercises you'd prefer not to do - we'll avoid them. Start typing to see suggestions."
        >
          <Autocomplete
            id="dislikedExercises"
            placeholder="E.g., Burpees, Running, Leg extensions..."
            suggestions={[]}
            onSearch={searchExercises}
            value={dislikedExercise}
            onChange={(val) => setValue('preferences.dislikedExercises.0', val)}
          />
        </FormField>

        <FormField
          label="Preferred Training Split (Optional)"
          htmlFor="preferredSplit"
          description="If unsure, leave as 'No preference' for optimal recommendation"
        >
          <Select
            id="preferredSplit"
            {...register('preferences.preferredSplit', {
              setValueAs: (value) => (value === '' ? null : value)
            })}
          >
            <option value="">No preference - Let AI decide based on my goals</option>
            <option value="full_body">Full Body - Train everything each session</option>
            <option value="upper_lower">Upper/Lower - Alternate upper and lower body</option>
            <option value="push_pull_legs">Push/Pull/Legs - 3-way split</option>
            <option value="bro_split">Bro Split - One muscle group per day</option>
            <option value="custom">Custom - I have a specific structure in mind</option>
          </Select>
        </FormField>

        <FormField
          label="How much cardio do you want?"
          htmlFor="cardioPreference"
          required
          error={errors.preferences?.cardioPreference?.message}
        >
          <Select
            id="cardioPreference"
            {...register('preferences.cardioPreference')}
          >
            <option value="none">None - Strength training only</option>
            <option value="minimal">Minimal - Just warm-up cardio</option>
            <option value="moderate">Moderate - 1-2 cardio sessions per week</option>
            <option value="extensive">Extensive - 3+ cardio sessions per week</option>
          </Select>
        </FormField>
      </CardContent>
    </Card>
  );
}
