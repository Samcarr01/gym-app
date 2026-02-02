'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { AlertCircle } from 'lucide-react';
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
        {/* Years of Training - Custom layout for slider */}
        <div className="space-y-2">
          <Label htmlFor="trainingYears" className={errors.experience?.trainingYears ? 'text-destructive' : ''}>
            How many years have you been training? <span className="text-destructive">*</span>
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
            <div className="flex items-center gap-1.5 text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{errors.experience.trainingYears.message}</span>
            </div>
          )}
        </div>

        {/* Current Level */}
        <FormField
          label="Current Training Level"
          htmlFor="currentLevel"
          required
          error={errors.experience?.currentLevel?.message}
        >
          <Select
            id="currentLevel"
            {...register('experience.currentLevel')}
          >
            <option value="beginner">Beginner - New to structured training or returning after a long break</option>
            <option value="intermediate">Intermediate - Training consistently for 1-3 years, understand form basics</option>
            <option value="advanced">Advanced - 3+ years consistent training, advanced programming needed</option>
          </Select>
        </FormField>

        {/* Training Consistency */}
        <FormField
          label="How consistent has your training been?"
          htmlFor="trainingConsistency"
          required
          description="This helps us set appropriate starting volume"
        >
          <Select
            id="trainingConsistency"
            {...register('experience.trainingConsistency')}
          >
            <option value="very_consistent">Very consistent - Rarely miss planned sessions</option>
            <option value="mostly_consistent">Mostly consistent - Occasional breaks (1-2 weeks)</option>
            <option value="inconsistent">Inconsistent - Frequent breaks or on-and-off training</option>
            <option value="returning">Returning - Long break (3+ months), rebuilding</option>
          </Select>
        </FormField>

        {/* Current Body Weight */}
        <FormField
          label="Current Body Weight (Optional)"
          htmlFor="currentBodyWeight"
          description="Helps us give specific protein targets (e.g., '150g/day' instead of '2g/kg')"
        >
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
        </FormField>

        {/* Current Lifts */}
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
        <FormField
          label="What have you been doing recently? (Optional)"
          htmlFor="recentTraining"
          description="Describe your training over the last 2-3 months"
        >
          <Textarea
            id="recentTraining"
            placeholder="E.g., 'Upper/lower split 4x/week', 'Running 3x/week + bodyweight work', 'CrossFit classes', etc."
            rows={3}
            {...register('experience.recentTraining')}
          />
        </FormField>

        {/* Strong Points */}
        <FormField
          label="Strong Points (Optional)"
          htmlFor="strongPoints"
          description="Comma-separated list of what you're good at"
        >
          <Input
            id="strongPoints"
            placeholder="E.g., 'Upper body', 'Squats', 'Endurance', 'Core strength'"
            {...register('experience.strongPoints.0')}
          />
        </FormField>

        {/* Weak Points */}
        <FormField
          label="Weak Points or Areas to Improve (Optional)"
          htmlFor="weakPoints"
          description="We'll emphasize these areas in your program"
        >
          <Input
            id="weakPoints"
            placeholder="E.g., 'Lower body', 'Shoulders', 'Mobility', 'Posterior chain'"
            {...register('experience.weakPoints.0')}
          />
        </FormField>
      </CardContent>
    </Card>
  );
}
