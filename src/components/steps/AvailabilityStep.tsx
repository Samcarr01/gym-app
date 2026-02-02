'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { AlertCircle } from 'lucide-react';
import { QuestionnaireData } from '@/lib/types';

export function AvailabilityStep() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<QuestionnaireData>();
  const daysPerWeek = watch('availability.daysPerWeek');
  const sessionDuration = watch('availability.sessionDuration');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability</CardTitle>
        <CardDescription>How much time can you commit to training?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Days Per Week - Custom layout for slider */}
        <div className="space-y-2">
          <Label htmlFor="daysPerWeek" className={errors.availability?.daysPerWeek ? 'text-destructive' : ''}>
            Days Per Week <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id="daysPerWeek"
              min={1}
              max={7}
              step={1}
              value={daysPerWeek}
              onChange={(e) => setValue('availability.daysPerWeek', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium w-16 text-right">{daysPerWeek} {daysPerWeek === 1 ? 'day' : 'days'}</span>
          </div>
          {errors.availability?.daysPerWeek && (
            <div className="flex items-center gap-1.5 text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{errors.availability.daysPerWeek.message}</span>
            </div>
          )}
        </div>

        {/* Session Duration - Custom layout for slider */}
        <div className="space-y-2">
          <Label htmlFor="sessionDuration" className={errors.availability?.sessionDuration ? 'text-destructive' : ''}>
            Session Duration <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id="sessionDuration"
              min={30}
              max={180}
              step={15}
              value={sessionDuration}
              onChange={(e) => setValue('availability.sessionDuration', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-medium w-16 text-right">{sessionDuration} min</span>
          </div>
          {errors.availability?.sessionDuration && (
            <div className="flex items-center gap-1.5 text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{errors.availability.sessionDuration.message}</span>
            </div>
          )}
        </div>

        {/* Time of Day */}
        <FormField
          label="Preferred Time of Day"
          htmlFor="timeOfDay"
          required
          error={errors.availability?.timeOfDay?.message}
        >
          <Select
            id="timeOfDay"
            {...register('availability.timeOfDay')}
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="flexible">Flexible</option>
          </Select>
        </FormField>
      </CardContent>
    </Card>
  );
}
