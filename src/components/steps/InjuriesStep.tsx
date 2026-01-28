'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionnaireData } from '@/lib/types';

export function InjuriesStep() {
  const { register } = useFormContext<QuestionnaireData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Injuries & Limitations</CardTitle>
        <CardDescription>Tell us about any injuries or movement restrictions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="currentInjuries">Current Injuries (Optional)</Label>
          <Input
            id="currentInjuries"
            placeholder="e.g., Lower back pain, shoulder tendinitis"
            {...register('injuries.currentInjuries.0.area')}
          />
          <p className="text-xs text-muted-foreground">
            Any injuries that are currently affecting your training
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pastInjuries">Past Injuries (Optional)</Label>
          <Input
            id="pastInjuries"
            placeholder="e.g., Previous knee surgery, old shoulder injury"
            {...register('injuries.pastInjuries.0.area')}
          />
          <p className="text-xs text-muted-foreground">
            Injuries that might still affect certain movements
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="movementRestrictions">Movement Restrictions (Optional)</Label>
          <Textarea
            id="movementRestrictions"
            placeholder="e.g., Can't squat below parallel, limited overhead range"
            {...register('injuries.movementRestrictions.0')}
          />
          <p className="text-xs text-muted-foreground">
            Any movements you need to avoid or modify
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="painAreas">Areas of Pain or Discomfort (Optional)</Label>
          <Input
            id="painAreas"
            placeholder="e.g., Lower back, right shoulder"
            {...register('injuries.painAreas.0')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
