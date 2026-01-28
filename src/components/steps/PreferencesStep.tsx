'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionnaireData } from '@/lib/types';

export function PreferencesStep() {
  const { register, formState: { errors } } = useFormContext<QuestionnaireData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Preferences</CardTitle>
        <CardDescription>Tell us what you enjoy so we can keep you motivated</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Favorite Exercises */}
        <div className="space-y-2">
          <Label htmlFor="favouriteExercises">Favorite Exercises (Optional)</Label>
          <Textarea
            id="favouriteExercises"
            placeholder="Enter each exercise on a new line:&#10;Farmers carries&#10;Pull-ups&#10;Deadlifts"
            rows={3}
            {...register('preferences.favouriteExercises.0')}
          />
          <p className="text-xs text-muted-foreground">
            List exercises you love - we'll include them in your program. One per line or comma-separated.
          </p>
        </div>

        {/* Disliked Exercises */}
        <div className="space-y-2">
          <Label htmlFor="dislikedExercises">Exercises to Avoid (Optional)</Label>
          <Textarea
            id="dislikedExercises"
            placeholder="Enter each exercise on a new line:&#10;Burpees&#10;Running&#10;Leg extensions"
            rows={3}
            {...register('preferences.dislikedExercises.0')}
          />
          <p className="text-xs text-muted-foreground">
            Exercises you'd prefer not to do - we'll avoid them
          </p>
        </div>

        {/* Preferred Split */}
        <div className="space-y-2">
          <Label htmlFor="preferredSplit">Preferred Training Split (Optional)</Label>
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
          <p className="text-xs text-muted-foreground">
            If unsure, leave as "No preference" for optimal recommendation
          </p>
        </div>

        {/* Cardio Preference */}
        <div className="space-y-2">
          <Label htmlFor="cardioPreference">How much cardio do you want? *</Label>
          <Select
            id="cardioPreference"
            {...register('preferences.cardioPreference')}
          >
            <option value="none">None - Strength training only</option>
            <option value="minimal">Minimal - Just warm-up cardio</option>
            <option value="moderate">Moderate - 1-2 cardio sessions per week</option>
            <option value="extensive">Extensive - 3+ cardio sessions per week</option>
          </Select>
          {errors.preferences?.cardioPreference && (
            <p className="text-sm text-destructive">{errors.preferences.cardioPreference.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
