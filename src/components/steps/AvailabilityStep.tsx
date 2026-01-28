'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        <div className="space-y-2">
          <Label htmlFor="daysPerWeek">Days Per Week *</Label>
          <Slider
            id="daysPerWeek"
            min={1}
            max={7}
            step={1}
            value={daysPerWeek}
            onChange={(e) => setValue('availability.daysPerWeek', parseInt(e.target.value))}
          />
          {errors.availability?.daysPerWeek && (
            <p className="text-sm text-destructive">{errors.availability.daysPerWeek.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sessionDuration">Session Duration (minutes) *</Label>
          <Slider
            id="sessionDuration"
            min={30}
            max={180}
            step={15}
            value={sessionDuration}
            onChange={(e) => setValue('availability.sessionDuration', parseInt(e.target.value))}
          />
          {errors.availability?.sessionDuration && (
            <p className="text-sm text-destructive">{errors.availability.sessionDuration.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeOfDay">Preferred Time of Day *</Label>
          <Select
            id="timeOfDay"
            {...register('availability.timeOfDay')}
            placeholder="Select preferred time"
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="flexible">Flexible</option>
          </Select>
          {errors.availability?.timeOfDay && (
            <p className="text-sm text-destructive">{errors.availability.timeOfDay.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
