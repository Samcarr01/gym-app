'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionnaireData } from '@/lib/types';

export function RecoveryStep() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<QuestionnaireData>();
  const sleepHours = watch('recovery.sleepHours');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recovery</CardTitle>
        <CardDescription>How well does your body recover?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="sleepHours">Average Sleep Hours Per Night *</Label>
          <Slider
            id="sleepHours"
            min={3}
            max={12}
            step={0.5}
            value={sleepHours}
            onChange={(e) => setValue('recovery.sleepHours', parseFloat(e.target.value))}
          />
          {errors.recovery?.sleepHours && (
            <p className="text-sm text-destructive">{errors.recovery.sleepHours.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sleepQuality">Sleep Quality *</Label>
          <Select
            id="sleepQuality"
            {...register('recovery.sleepQuality')}
            placeholder="Select sleep quality"
          >
            <option value="poor">Poor</option>
            <option value="fair">Fair</option>
            <option value="good">Good</option>
            <option value="excellent">Excellent</option>
          </Select>
          {errors.recovery?.sleepQuality && (
            <p className="text-sm text-destructive">{errors.recovery.sleepQuality.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stressLevel">Current Stress Level *</Label>
          <Select
            id="stressLevel"
            {...register('recovery.stressLevel')}
            placeholder="Select stress level"
          >
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
            <option value="very_high">Very High</option>
          </Select>
          {errors.recovery?.stressLevel && (
            <p className="text-sm text-destructive">{errors.recovery.stressLevel.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="recoveryCapacity">Recovery Capacity *</Label>
          <Select
            id="recoveryCapacity"
            {...register('recovery.recoveryCapacity')}
            placeholder="Select recovery capacity"
          >
            <option value="low">Low (need lots of rest between sessions)</option>
            <option value="moderate">Moderate (typical recovery)</option>
            <option value="high">High (recover quickly)</option>
          </Select>
          {errors.recovery?.recoveryCapacity && (
            <p className="text-sm text-destructive">{errors.recovery.recoveryCapacity.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
