'use client';

import { useFormContext } from 'react-hook-form';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { QuestionnaireData } from '@/lib/types';

export function NutritionStep() {
  const { register, formState: { errors } } = useFormContext<QuestionnaireData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition</CardTitle>
        <CardDescription>Tell us about your diet and nutrition</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          label="Nutrition Approach"
          htmlFor="nutritionApproach"
          required
          error={errors.nutrition?.nutritionApproach?.message}
        >
          <Select
            id="nutritionApproach"
            {...register('nutrition.nutritionApproach')}
          >
            <option value="maintenance">Maintenance (maintaining weight)</option>
            <option value="surplus">Surplus (gaining weight)</option>
            <option value="deficit">Deficit (losing weight)</option>
            <option value="intuitive">Intuitive (not tracking)</option>
          </Select>
        </FormField>

        <FormField
          label="Protein Intake"
          htmlFor="proteinIntake"
          required
          error={errors.nutrition?.proteinIntake?.message}
        >
          <Select
            id="proteinIntake"
            {...register('nutrition.proteinIntake')}
          >
            <option value="low">Low (&lt;0.6g/lb bodyweight)</option>
            <option value="moderate">Moderate (0.6-0.8g/lb)</option>
            <option value="high">High (0.8-1g/lb)</option>
            <option value="very_high">Very High (&gt;1g/lb)</option>
          </Select>
        </FormField>

        <FormField
          label="Dietary Restrictions (Optional)"
          htmlFor="dietaryRestrictions"
          description="Any dietary restrictions that might affect recovery or performance"
        >
          <Input
            id="dietaryRestrictions"
            placeholder="e.g., Vegetarian, lactose intolerant"
            {...register('nutrition.dietaryRestrictions.0')}
          />
        </FormField>

        <FormField
          label="Supplement Use (Optional)"
          htmlFor="supplementUse"
        >
          <Input
            id="supplementUse"
            placeholder="e.g., Protein powder, creatine, pre-workout"
            {...register('nutrition.supplementUse.0')}
          />
        </FormField>

        <FormField
          label="Favorite Foods (Optional)"
          htmlFor="favoriteFoods"
          description="Specific foods or food types you enjoy (e.g., 'chicken' or 'poultry')"
        >
          <Input
            id="favoriteFoods"
            placeholder="e.g., Chicken, rice, eggs, Greek yogurt, pasta"
            {...register('nutrition.favoriteFoods.0')}
          />
        </FormField>

        <FormField
          label="Foods to Avoid (Optional)"
          htmlFor="dislikedFoods"
          description="Specific foods or entire categories to avoid (e.g., 'salmon' or 'all seafood')"
        >
          <Input
            id="dislikedFoods"
            placeholder="e.g., Fish, seafood, mushrooms, fruit, red meat"
            {...register('nutrition.dislikedFoods.0')}
          />
        </FormField>
      </CardContent>
    </Card>
  );
}
