'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionnaireData } from '@/lib/types';

export function EquipmentStep() {
  const { register, watch, formState: { errors } } = useFormContext<QuestionnaireData>();
  const gymAccess = watch('equipment.gymAccess');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipment</CardTitle>
        <CardDescription>What equipment do you have access to?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="gymAccess">Do you have gym access? *</Label>
          <Select
            id="gymAccess"
            {...register('equipment.gymAccess', {
              setValueAs: (value) => value === 'true'
            })}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
          {errors.equipment?.gymAccess && (
            <p className="text-sm text-destructive">{errors.equipment.gymAccess.message}</p>
          )}
        </div>

        {gymAccess && (
          <div className="space-y-2">
            <Label htmlFor="gymType">Gym Type</Label>
            <Select
              id="gymType"
              {...register('equipment.gymType', {
                setValueAs: (value) => (value === '' ? null : value)
              })}
              placeholder="Select gym type"
            >
              <option value="">Select type</option>
              <option value="commercial">Commercial Gym</option>
              <option value="home">Home Gym</option>
              <option value="hotel">Hotel Gym</option>
              <option value="outdoor">Outdoor</option>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="availableEquipment">Available Equipment (Optional)</Label>
          <Input
            id="availableEquipment"
            placeholder="e.g., Barbell, dumbbells, resistance bands"
            {...register('equipment.availableEquipment.0')}
          />
          <p className="text-xs text-muted-foreground">
            List any specific equipment you have access to
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="limitedEquipment">Limited or Missing Equipment (Optional)</Label>
          <Input
            id="limitedEquipment"
            placeholder="e.g., No leg press, limited dumbbells"
            {...register('equipment.limitedEquipment.0')}
          />
          <p className="text-xs text-muted-foreground">
            Anything you don't have access to
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
