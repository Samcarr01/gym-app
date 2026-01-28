'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionnaireData } from '@/lib/types';

export function GoalsStep() {
  const { register, watch, formState: { errors } } = useFormContext<QuestionnaireData>();
  const primaryGoal = watch('goals.primaryGoal');
  const secondaryGoal = watch('goals.secondaryGoal');

  const isSportSpecific = primaryGoal === 'sport_specific' || secondaryGoal === 'sport_specific';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Goals</CardTitle>
        <CardDescription>Tell us what you want to achieve so we can create the perfect program</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Goal */}
        <div className="space-y-2">
          <Label htmlFor="primaryGoal">What's your main goal? *</Label>
          <Select
            id="primaryGoal"
            {...register('goals.primaryGoal')}
          >
            <option value="muscle_building">Build Muscle (Hypertrophy)</option>
            <option value="strength">Get Stronger (Powerlifting/Strength focus)</option>
            <option value="fat_loss">Lose Fat (While maintaining muscle)</option>
            <option value="endurance">Improve Endurance (Cardio fitness)</option>
            <option value="sport_specific">Sport-Specific (Athletic performance)</option>
            <option value="general_fitness">General Fitness (Overall health)</option>
          </Select>
          {errors.goals?.primaryGoal && (
            <p className="text-sm text-destructive">{errors.goals.primaryGoal.message}</p>
          )}
        </div>

        {/* Secondary Goal */}
        <div className="space-y-2">
          <Label htmlFor="secondaryGoal">Secondary Goal (Optional)</Label>
          <Select
            id="secondaryGoal"
            {...register('goals.secondaryGoal', {
              setValueAs: (value) => (value === '' ? null : value)
            })}
          >
            <option value="">None - Focus on primary goal only</option>
            <option value="muscle_building">Build Muscle</option>
            <option value="strength">Get Stronger</option>
            <option value="fat_loss">Lose Fat</option>
            <option value="endurance">Improve Endurance</option>
            <option value="sport_specific">Sport-Specific</option>
            <option value="general_fitness">General Fitness</option>
          </Select>
          <p className="text-xs text-muted-foreground">
            E.g., build muscle while also improving endurance
          </p>
        </div>

        {/* Sport Details - Conditional */}
        {isSportSpecific && (
          <div className="space-y-4 pt-2 border-t">
            <div>
              <Label className="text-base">Sport Details</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Help us tailor your program to your sport
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sportName">What sport do you play?</Label>
              <Input
                id="sportName"
                placeholder="E.g., Basketball, Soccer, MMA, Powerlifting, Cycling"
                {...register('goals.sportDetails.sportName')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentPhase">Current Training Phase</Label>
              <Select
                id="currentPhase"
                {...register('goals.sportDetails.currentPhase')}
              >
                <option value="not-applicable">Not applicable / No competitive season</option>
                <option value="off-season">Off-Season - Build strength and size</option>
                <option value="pre-season">Pre-Season - Getting ready for competition</option>
                <option value="in-season">In-Season - Maintain strength during competition</option>
                <option value="post-season">Post-Season - Recovery and light training</option>
              </Select>
              <p className="text-xs text-muted-foreground">
                This affects training volume and intensity
              </p>
            </div>
          </div>
        )}

        {/* Timeframe */}
        <div className="space-y-2">
          <Label htmlFor="timeframe">How long do you want to follow this program? *</Label>
          <Select
            id="timeframe"
            {...register('goals.timeframe')}
          >
            <option value="4 weeks">4 weeks - Quick start or test program</option>
            <option value="8 weeks">8 weeks - See initial results</option>
            <option value="3 months">3 months - Standard mesocycle</option>
            <option value="6 months">6 months - Significant transformation</option>
            <option value="1 year">1 year - Long-term progression</option>
          </Select>
          {errors.goals?.timeframe && (
            <p className="text-sm text-destructive">{errors.goals.timeframe.message}</p>
          )}
        </div>

        {/* Specific Targets */}
        <div className="space-y-2">
          <Label htmlFor="specificTargets">Specific Targets or Focus Areas (Optional)</Label>
          <Input
            id="specificTargets"
            placeholder="E.g., 'Increase bench to 100kg', 'Build bigger shoulders', 'Improve vertical jump'"
            {...register('goals.specificTargets.0')}
          />
          <p className="text-xs text-muted-foreground">
            Any specific exercises, muscles, or metrics you want to improve
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
