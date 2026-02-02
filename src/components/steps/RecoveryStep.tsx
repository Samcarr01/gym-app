'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { AlertCircle } from 'lucide-react';
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
        {/* Sleep Hours - Custom layout for slider */}
        <div className="space-y-2">
          <Label htmlFor="sleepHours" className={errors.recovery?.sleepHours ? 'text-destructive' : ''}>
            Average Sleep Hours Per Night <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id="sleepHours"
              min={3}
              max={12}
              step={0.5}
              value={sleepHours}
              onChange={(e) => setValue('recovery.sleepHours', parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium w-16 text-right">{sleepHours} hrs</span>
          </div>
          {errors.recovery?.sleepHours && (
            <div className="flex items-center gap-1.5 text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{errors.recovery.sleepHours.message}</span>
            </div>
          )}
        </div>

        <FormField
          label="Sleep Quality"
          htmlFor="sleepQuality"
          required
          error={errors.recovery?.sleepQuality?.message}
        >
          <Select
            id="sleepQuality"
            {...register('recovery.sleepQuality')}
          >
            <option value="poor">Poor</option>
            <option value="fair">Fair</option>
            <option value="good">Good</option>
            <option value="excellent">Excellent</option>
          </Select>
        </FormField>

        <FormField
          label="Current Stress Level"
          htmlFor="stressLevel"
          required
          error={errors.recovery?.stressLevel?.message}
        >
          <Select
            id="stressLevel"
            {...register('recovery.stressLevel')}
          >
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
            <option value="very_high">Very High</option>
          </Select>
        </FormField>

        <FormField
          label="Recovery Capacity"
          htmlFor="recoveryCapacity"
          required
          error={errors.recovery?.recoveryCapacity?.message}
        >
          <Select
            id="recoveryCapacity"
            {...register('recovery.recoveryCapacity')}
          >
            <option value="low">Low (need lots of rest between sessions)</option>
            <option value="moderate">Moderate (typical recovery)</option>
            <option value="high">High (recover quickly)</option>
          </Select>
        </FormField>
      </CardContent>
    </Card>
  );
}
