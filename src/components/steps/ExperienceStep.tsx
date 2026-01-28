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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Experience</CardTitle>
        <CardDescription>Tell us about your fitness background</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="trainingYears">Years of Training Experience *</Label>
          <Slider
            id="trainingYears"
            min={0}
            max={30}
            step={1}
            value={trainingYears}
            onChange={(e) => setValue('experience.trainingYears', parseInt(e.target.value))}
          />
          {errors.experience?.trainingYears && (
            <p className="text-sm text-destructive">{errors.experience.trainingYears.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentLevel">Current Training Level *</Label>
          <Select
            id="currentLevel"
            {...register('experience.currentLevel')}
            placeholder="Select your level"
          >
            <option value="beginner">Beginner (0-1 years)</option>
            <option value="intermediate">Intermediate (1-3 years)</option>
            <option value="advanced">Advanced (3+ years)</option>
          </Select>
          {errors.experience?.currentLevel && (
            <p className="text-sm text-destructive">{errors.experience.currentLevel.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="recentTraining">Recent Training History (Optional)</Label>
          <Textarea
            id="recentTraining"
            placeholder="Describe what you've been doing recently..."
            {...register('experience.recentTraining')}
          />
          <p className="text-xs text-muted-foreground">
            What have you been doing over the last few months?
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="strongPoints">Strong Points (Optional)</Label>
          <Input
            id="strongPoints"
            placeholder="e.g., Upper body, squats, endurance"
            {...register('experience.strongPoints.0')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weakPoints">Weak Points (Optional)</Label>
          <Input
            id="weakPoints"
            placeholder="e.g., Lower body, shoulders, mobility"
            {...register('experience.weakPoints.0')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
