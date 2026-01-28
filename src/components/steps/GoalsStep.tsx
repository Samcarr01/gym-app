'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionnaireData } from '@/lib/types';

export function GoalsStep() {
  const { register, formState: { errors } } = useFormContext<QuestionnaireData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Goals</CardTitle>
        <CardDescription>What do you want to achieve with your training?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="primaryGoal">Primary Goal *</Label>
          <Select
            id="primaryGoal"
            {...register('goals.primaryGoal')}
            placeholder="Select your primary goal"
          >
            <option value="muscle_building">Muscle Building</option>
            <option value="fat_loss">Fat Loss</option>
            <option value="strength">Strength</option>
            <option value="endurance">Endurance</option>
            <option value="general_fitness">General Fitness</option>
            <option value="sport_specific">Sport Specific</option>
          </Select>
          {errors.goals?.primaryGoal && (
            <p className="text-sm text-destructive">{errors.goals.primaryGoal.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondaryGoal">Secondary Goal (Optional)</Label>
          <Select
            id="secondaryGoal"
            {...register('goals.secondaryGoal', {
              setValueAs: (value) => (value === '' ? null : value)
            })}
            placeholder="Select a secondary goal"
          >
            <option value="">None</option>
            <option value="muscle_building">Muscle Building</option>
            <option value="fat_loss">Fat Loss</option>
            <option value="strength">Strength</option>
            <option value="endurance">Endurance</option>
            <option value="general_fitness">General Fitness</option>
            <option value="sport_specific">Sport Specific</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeframe">Timeframe *</Label>
          <Select
            id="timeframe"
            {...register('goals.timeframe')}
            placeholder="Select your timeframe"
          >
            <option value="4 weeks">4 weeks</option>
            <option value="8 weeks">8 weeks</option>
            <option value="3 months">3 months</option>
            <option value="6 months">6 months</option>
            <option value="1 year">1 year</option>
          </Select>
          {errors.goals?.timeframe && (
            <p className="text-sm text-destructive">{errors.goals.timeframe.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="specificTargets">Specific Targets (Optional)</Label>
          <Input
            id="specificTargets"
            placeholder="e.g., Increase bench press, lose 10 lbs"
            {...register('goals.specificTargets.0')}
          />
          <p className="text-xs text-muted-foreground">
            Any specific exercises or metrics you want to improve
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
