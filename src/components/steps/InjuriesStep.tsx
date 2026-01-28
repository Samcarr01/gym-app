'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionnaireData } from '@/lib/types';

export function InjuriesStep() {
  const { register, watch } = useFormContext<QuestionnaireData>();
  const currentInjuryArea = watch('injuries.currentInjuries.0.area');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Injuries & Limitations</CardTitle>
        <CardDescription>
          Tell us about any injuries so we can create a safe program (all fields optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Injuries */}
        <div className="space-y-4">
          <div>
            <Label className="text-base">Current Injuries</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Any injuries currently affecting your training
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentInjuryArea">Injury Location</Label>
            <Input
              id="currentInjuryArea"
              placeholder="E.g., 'Lower back', 'Right shoulder', 'Left knee'"
              {...register('injuries.currentInjuries.0.area')}
            />
          </div>

          {currentInjuryArea && (
            <>
              <div className="space-y-2">
                <Label htmlFor="currentInjuryStatus">Injury Status</Label>
                <Select
                  id="currentInjuryStatus"
                  {...register('injuries.currentInjuries.0.status')}
                >
                  <option value="acute">Acute - Recent injury, still painful during daily activities</option>
                  <option value="healing">Healing - Recovering, some movements still restricted</option>
                  <option value="chronic">Chronic - Long-term issue that I work around</option>
                  <option value="history">History - Past injury, being cautious but mostly fine</option>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How would you describe the current state?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentInjurySeverity">How much does it limit you?</Label>
                <Select
                  id="currentInjurySeverity"
                  {...register('injuries.currentInjuries.0.severity')}
                >
                  <option value="low">Low - Minor discomfort, doesn't really limit training</option>
                  <option value="medium">Medium - Need to modify some exercises</option>
                  <option value="high">High - Severely limits certain movements</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentInjuryNotes">Additional Details</Label>
                <Textarea
                  id="currentInjuryNotes"
                  placeholder="E.g., 'Can't go heavy on squats', 'Pain when pressing overhead', 'No issues with pulling movements'"
                  rows={2}
                  {...register('injuries.currentInjuries.0.notes')}
                />
              </div>
            </>
          )}
        </div>

        {/* Past Injuries */}
        <div className="space-y-2 pt-2 border-t">
          <Label htmlFor="pastInjuries">Past Injuries to Be Aware Of</Label>
          <Input
            id="pastInjuries"
            placeholder="E.g., 'Previous knee surgery 2 years ago', 'Old shoulder dislocation'"
            {...register('injuries.pastInjuries.0.area')}
          />
          <p className="text-xs text-muted-foreground">
            Fully healed injuries that might still benefit from caution
          </p>
        </div>

        {/* Movement Restrictions */}
        <div className="space-y-2">
          <Label htmlFor="movementRestrictions">Movement Restrictions</Label>
          <Textarea
            id="movementRestrictions"
            placeholder="E.g., 'Can't squat below parallel', 'Limited overhead range', 'Avoid jumping/impact'"
            rows={2}
            {...register('injuries.movementRestrictions.0')}
          />
          <p className="text-xs text-muted-foreground">
            Any specific movements you need to avoid or modify
          </p>
        </div>

        {/* Pain Areas */}
        <div className="space-y-2">
          <Label htmlFor="painAreas">Areas of Discomfort</Label>
          <Input
            id="painAreas"
            placeholder="E.g., 'Lower back after sitting', 'Right hip tightness'"
            {...register('injuries.painAreas.0')}
          />
          <p className="text-xs text-muted-foreground">
            Chronic discomfort or tightness (not necessarily injuries)
          </p>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> This program is for general fitness. If you have acute or severe injuries,
            please consult a healthcare professional or physical therapist for appropriate guidance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
