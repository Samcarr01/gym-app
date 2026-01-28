'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionnaireData } from '@/lib/types';

export function PreferencesStep() {
  const { register, formState: { errors } } = useFormContext<QuestionnaireData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Preferences</CardTitle>
        <CardDescription>What do you enjoy and want to focus on?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="favouriteExercises">Favourite Exercises (Optional)</Label>
          <Input
            id="favouriteExercises"
            placeholder="e.g., Bench press, deadlifts, pull-ups"
            {...register('preferences.favouriteExercises.0')}
          />
          <p className="text-xs text-muted-foreground">
            Exercises you enjoy and want to include
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dislikedExercises">Disliked Exercises (Optional)</Label>
          <Input
            id="dislikedExercises"
            placeholder="e.g., Burpees, running, leg extensions"
            {...register('preferences.dislikedExercises.0')}
          />
          <p className="text-xs text-muted-foreground">
            Exercises you'd prefer to avoid
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredSplit">Preferred Training Split (Optional)</Label>
          <Select
            id="preferredSplit"
            {...register('preferences.preferredSplit')}
            placeholder="Select a split or leave blank for AI to decide"
          >
            <option value="">No preference</option>
            <option value="full_body">Full Body</option>
            <option value="upper_lower">Upper/Lower</option>
            <option value="push_pull_legs">Push/Pull/Legs</option>
            <option value="bro_split">Bro Split</option>
            <option value="custom">Custom</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cardioPreference">Cardio Preference *</Label>
          <Select
            id="cardioPreference"
            {...register('preferences.cardioPreference')}
            placeholder="Select cardio preference"
          >
            <option value="none">None</option>
            <option value="minimal">Minimal (warm-up only)</option>
            <option value="moderate">Moderate (1-2 sessions/week)</option>
            <option value="extensive">Extensive (3+ sessions/week)</option>
          </Select>
          {errors.preferences?.cardioPreference && (
            <p className="text-sm text-destructive">{errors.preferences.cardioPreference.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
