'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { CheckCircle2 } from 'lucide-react';
import { QuestionnaireData } from '@/lib/types';

export function InjuriesStep() {
  const { register, watch, setValue } = useFormContext<QuestionnaireData>();
  const noInjuries = watch('injuries.noInjuries');
  const currentInjuryArea = watch('injuries.currentInjuries.0.area');

  const handleNoInjuriesToggle = () => {
    setValue('injuries.noInjuries', !noInjuries);
    // Clear injury fields when toggling to "no injuries"
    if (!noInjuries) {
      setValue('injuries.currentInjuries', []);
      setValue('injuries.pastInjuries', []);
      setValue('injuries.movementRestrictions', []);
      setValue('injuries.painAreas', []);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Injuries & Limitations</CardTitle>
        <CardDescription>
          Tell us about any injuries so we can create a safe program
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick option: No injuries */}
        <button
          type="button"
          onClick={handleNoInjuriesToggle}
          className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${
            noInjuries
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-border hover:border-muted-foreground/30 bg-muted/30'
          }`}
        >
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            noInjuries ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground/30'
          }`}>
            {noInjuries && <CheckCircle2 className="h-4 w-4 text-white" />}
          </div>
          <div>
            <p className="font-medium">No injuries or limitations</p>
            <p className="text-sm text-muted-foreground">
              I'm injury-free and have no movement restrictions
            </p>
          </div>
        </button>

        {/* Hidden input for form registration */}
        <input type="hidden" {...register('injuries.noInjuries')} />

        {/* Show detailed injury fields only if not marked as injury-free */}
        {!noInjuries && (
          <>
            {/* Current Injuries */}
            <div className="space-y-4">
              <div>
                <Label className="text-base">Current Injuries</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Any injuries currently affecting your training (optional)
                </p>
              </div>

              <FormField
                label="Injury Location"
                htmlFor="currentInjuryArea"
              >
                <Input
                  id="currentInjuryArea"
                  placeholder="E.g., 'Lower back', 'Right shoulder', 'Left knee'"
                  {...register('injuries.currentInjuries.0.area')}
                />
              </FormField>

              {currentInjuryArea && (
                <>
                  <FormField
                    label="Injury Status"
                    htmlFor="currentInjuryStatus"
                    description="How would you describe the current state?"
                  >
                    <Select
                      id="currentInjuryStatus"
                      {...register('injuries.currentInjuries.0.status')}
                    >
                      <option value="acute">Acute - Recent injury, still painful during daily activities</option>
                      <option value="healing">Healing - Recovering, some movements still restricted</option>
                      <option value="chronic">Chronic - Long-term issue that I work around</option>
                      <option value="history">History - Past injury, being cautious but mostly fine</option>
                    </Select>
                  </FormField>

                  <FormField
                    label="How much does it limit you?"
                    htmlFor="currentInjurySeverity"
                  >
                    <Select
                      id="currentInjurySeverity"
                      {...register('injuries.currentInjuries.0.severity')}
                    >
                      <option value="low">Low - Minor discomfort, doesn't really limit training</option>
                      <option value="medium">Medium - Need to modify some exercises</option>
                      <option value="high">High - Severely limits certain movements</option>
                    </Select>
                  </FormField>

                  <FormField
                    label="Additional Details"
                    htmlFor="currentInjuryNotes"
                  >
                    <Textarea
                      id="currentInjuryNotes"
                      placeholder="E.g., 'Can't go heavy on squats', 'Pain when pressing overhead', 'No issues with pulling movements'"
                      rows={2}
                      {...register('injuries.currentInjuries.0.notes')}
                    />
                  </FormField>
                </>
              )}
            </div>

            {/* Past Injuries */}
            <div className="pt-2 border-t">
              <FormField
                label="Past Injuries to Be Aware Of"
                htmlFor="pastInjuries"
                description="Fully healed injuries that might still benefit from caution"
              >
                <Input
                  id="pastInjuries"
                  placeholder="E.g., 'Previous knee surgery 2 years ago', 'Old shoulder dislocation'"
                  {...register('injuries.pastInjuries.0.area')}
                />
              </FormField>
            </div>

            {/* Movement Restrictions */}
            <FormField
              label="Movement Restrictions"
              htmlFor="movementRestrictions"
              description="Any specific movements you need to avoid or modify"
            >
              <Textarea
                id="movementRestrictions"
                placeholder="E.g., 'Can't squat below parallel', 'Limited overhead range', 'Avoid jumping/impact'"
                rows={2}
                {...register('injuries.movementRestrictions.0')}
              />
            </FormField>

            {/* Pain Areas */}
            <FormField
              label="Areas of Discomfort"
              htmlFor="painAreas"
              description="Chronic discomfort or tightness (not necessarily injuries)"
            >
              <Input
                id="painAreas"
                placeholder="E.g., 'Lower back after sitting', 'Right hip tightness'"
                {...register('injuries.painAreas.0')}
              />
            </FormField>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> This program is for general fitness. If you have acute or severe injuries,
                please consult a healthcare professional or physical therapist for appropriate guidance.
              </p>
            </div>
          </>
        )}

        {noInjuries && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Great! We'll create your program without any injury-related modifications.
              You can always come back and update this if your situation changes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
