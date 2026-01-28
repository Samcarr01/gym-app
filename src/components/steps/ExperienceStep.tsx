'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionnaireData } from '@/lib/types';

export function ExperienceStep() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<QuestionnaireData>();
  const trainingYears = watch('experience.trainingYears');
  const currentLevel = watch('experience.currentLevel');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Experience</CardTitle>
        <CardDescription>Help us understand your fitness background to create the perfect program</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Years of Training */}
        <div className="space-y-2">
          <Label htmlFor="trainingYears">
            How many years have you been training? *
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id="trainingYears"
              min={0}
              max={30}
              step={1}
              value={trainingYears}
              onChange={(e) => setValue('experience.trainingYears', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium w-16 text-right">{trainingYears} {trainingYears === 1 ? 'year' : 'years'}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Structured training with weights, bodyweight, or sports
          </p>
          {errors.experience?.trainingYears && (
            <p className="text-sm text-destructive">{errors.experience.trainingYears.message}</p>
          )}
        </div>

        {/* Current Level */}
        <div className="space-y-2">
          <Label htmlFor="currentLevel">Current Training Level *</Label>
          <Select
            id="currentLevel"
            {...register('experience.currentLevel')}
          >
            <option value="beginner">Beginner - New to structured training or returning after a long break</option>
            <option value="intermediate">Intermediate - Training consistently for 1-3 years, understand form basics</option>
            <option value="advanced">Advanced - 3+ years consistent training, advanced programming needed</option>
          </Select>
          {errors.experience?.currentLevel && (
            <p className="text-sm text-destructive">{errors.experience.currentLevel.message}</p>
          )}
        </div>

        {/* Training Consistency - NEW */}
        <div className="space-y-2">
          <Label htmlFor="trainingConsistency">How consistent has your training been? *</Label>
          <Select
            id="trainingConsistency"
            {...register('experience.trainingConsistency')}
          >
            <option value="very_consistent">Very consistent - Rarely miss planned sessions</option>
            <option value="mostly_consistent">Mostly consistent - Occasional breaks (1-2 weeks)</option>
            <option value="inconsistent">Inconsistent - Frequent breaks or on-and-off training</option>
            <option value="returning">Returning - Long break (3+ months), rebuilding</option>
          </Select>
          <p className="text-xs text-muted-foreground">
            This helps us set appropriate starting volume
          </p>
        </div>

        {/* Current Body Weight - NEW */}
        <div className="space-y-2">
          <Label htmlFor="currentBodyWeight">Current Body Weight (Optional)</Label>
          <div className="flex gap-2 items-center">
            <Input
              id="currentBodyWeight"
              type="number"
              min="30"
              max="300"
              step="0.5"
              placeholder="75"
              {...register('experience.currentBodyWeight', { valueAsNumber: true })}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">kg</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Helps us give specific protein targets (e.g., "150g/day" instead of "2g/kg")
          </p>
        </div>

        {/* Current Lifts - NEW */}
        {currentLevel !== 'beginner' && (
          <div className="space-y-3 pt-2 border-t">
            <div>
              <Label className="text-base">Current Working Weights (Optional)</Label>
              <p className="text-xs text-muted-foreground mt-1">
                If known, enter your current working weights (kg) for major lifts. This helps us set realistic progression targets.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="squat" className="text-sm font-normal">Squat</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="squat"
                    type="number"
                    min="0"
                    step="2.5"
                    placeholder="100"
                    {...register('experience.currentLifts.squat', { valueAsNumber: true })}
                    className="w-24"
                  />
                  <span className="text-xs text-muted-foreground">kg</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bench" className="text-sm font-normal">Bench Press</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="bench"
                    type="number"
                    min="0"
                    step="2.5"
                    placeholder="70"
                    {...register('experience.currentLifts.bench', { valueAsNumber: true })}
                    className="w-24"
                  />
                  <span className="text-xs text-muted-foreground">kg</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadlift" className="text-sm font-normal">Deadlift</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="deadlift"
                    type="number"
                    min="0"
                    step="2.5"
                    placeholder="120"
                    {...register('experience.currentLifts.deadlift', { valueAsNumber: true })}
                    className="w-24"
                  />
                  <span className="text-xs text-muted-foreground">kg</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="overheadPress" className="text-sm font-normal">Overhead Press</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="overheadPress"
                    type="number"
                    min="0"
                    step="2.5"
                    placeholder="50"
                    {...register('experience.currentLifts.overheadPress', { valueAsNumber: true })}
                    className="w-24"
                  />
                  <span className="text-xs text-muted-foreground">kg</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Training History */}
        <div className="space-y-2">
          <Label htmlFor="recentTraining">What have you been doing recently? (Optional)</Label>
          <Textarea
            id="recentTraining"
            placeholder="E.g., 'Upper/lower split 4x/week', 'Running 3x/week + bodyweight work', 'CrossFit classes', etc."
            rows={3}
            {...register('experience.recentTraining')}
          />
          <p className="text-xs text-muted-foreground">
            Describe your training over the last 2-3 months
          </p>
        </div>

        {/* Strong Points */}
        <div className="space-y-2">
          <Label htmlFor="strongPoints">Strong Points (Optional)</Label>
          <Input
            id="strongPoints"
            placeholder="E.g., 'Upper body', 'Squats', 'Endurance', 'Core strength'"
            {...register('experience.strongPoints.0')}
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated list of what you're good at
          </p>
        </div>

        {/* Weak Points */}
        <div className="space-y-2">
          <Label htmlFor="weakPoints">Weak Points or Areas to Improve (Optional)</Label>
          <Input
            id="weakPoints"
            placeholder="E.g., 'Lower body', 'Shoulders', 'Mobility', 'Posterior chain'"
            {...register('experience.weakPoints.0')}
          />
          <p className="text-xs text-muted-foreground">
            We'll emphasize these areas in your program
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
