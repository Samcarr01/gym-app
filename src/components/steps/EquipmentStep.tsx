'use client';

import { useFormContext } from 'react-hook-form';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
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
        <FormField
          label="Do you have gym access?"
          htmlFor="gymAccess"
          required
          error={errors.equipment?.gymAccess?.message}
        >
          <Select
            id="gymAccess"
            {...register('equipment.gymAccess', {
              setValueAs: (value) => value === 'true'
            })}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
        </FormField>

        {gymAccess && (
          <FormField
            label="Gym Type"
            htmlFor="gymType"
          >
            <Select
              id="gymType"
              {...register('equipment.gymType', {
                setValueAs: (value) => (value === '' ? null : value)
              })}
            >
              <option value="">Select type</option>
              <option value="commercial">Commercial Gym</option>
              <option value="home">Home Gym</option>
              <option value="hotel">Hotel Gym</option>
              <option value="outdoor">Outdoor</option>
            </Select>
          </FormField>
        )}

        <FormField
          label="Available Equipment (Optional)"
          htmlFor="availableEquipment"
          description="List any specific equipment you have access to"
        >
          <Input
            id="availableEquipment"
            placeholder="e.g., Barbell, dumbbells, resistance bands"
            {...register('equipment.availableEquipment.0')}
          />
        </FormField>

        <FormField
          label="Limited or Missing Equipment (Optional)"
          htmlFor="limitedEquipment"
          description="Anything you don't have access to"
        >
          <Input
            id="limitedEquipment"
            placeholder="e.g., No leg press, limited dumbbells"
            {...register('equipment.limitedEquipment.0')}
          />
        </FormField>
      </CardContent>
    </Card>
  );
}
