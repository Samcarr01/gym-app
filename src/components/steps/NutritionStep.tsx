'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        <div className="space-y-2">
          <Label htmlFor="nutritionApproach">Nutrition Approach *</Label>
          <Select
            id="nutritionApproach"
            {...register('nutrition.nutritionApproach')}
            placeholder="Select your approach"
          >
            <option value="maintenance">Maintenance (maintaining weight)</option>
            <option value="surplus">Surplus (gaining weight)</option>
            <option value="deficit">Deficit (losing weight)</option>
            <option value="intuitive">Intuitive (not tracking)</option>
          </Select>
          {errors.nutrition?.nutritionApproach && (
            <p className="text-sm text-destructive">{errors.nutrition.nutritionApproach.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="proteinIntake">Protein Intake *</Label>
          <Select
            id="proteinIntake"
            {...register('nutrition.proteinIntake')}
            placeholder="Select protein intake"
          >
            <option value="low">Low (&lt;0.6g/lb bodyweight)</option>
            <option value="moderate">Moderate (0.6-0.8g/lb)</option>
            <option value="high">High (0.8-1g/lb)</option>
            <option value="very_high">Very High (&gt;1g/lb)</option>
          </Select>
          {errors.nutrition?.proteinIntake && (
            <p className="text-sm text-destructive">{errors.nutrition.proteinIntake.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dietaryRestrictions">Dietary Restrictions (Optional)</Label>
          <Input
            id="dietaryRestrictions"
            placeholder="e.g., Vegetarian, lactose intolerant"
            {...register('nutrition.dietaryRestrictions.0')}
          />
          <p className="text-xs text-muted-foreground">
            Any dietary restrictions that might affect recovery or performance
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplementUse">Supplement Use (Optional)</Label>
          <Input
            id="supplementUse"
            placeholder="e.g., Protein powder, creatine, pre-workout"
            {...register('nutrition.supplementUse.0')}
          />
        </div>

        {/* Favorite Foods */}
        <div className="space-y-2">
          <Label htmlFor="favoriteFoods">Favorite Foods (Optional)</Label>
          <Input
            id="favoriteFoods"
            placeholder="e.g., Chicken, rice, eggs, Greek yogurt, pasta"
            {...register('nutrition.favoriteFoods.0')}
          />
          <p className="text-xs text-muted-foreground">
            Specific foods or food types you enjoy (e.g., "chicken" or "poultry")
          </p>
        </div>

        {/* Disliked Foods */}
        <div className="space-y-2">
          <Label htmlFor="dislikedFoods">Foods to Avoid (Optional)</Label>
          <Input
            id="dislikedFoods"
            placeholder="e.g., Fish, seafood, mushrooms, fruit, red meat"
            {...register('nutrition.dislikedFoods.0')}
          />
          <p className="text-xs text-muted-foreground">
            Specific foods or entire categories to avoid (e.g., "salmon" or "all seafood")
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
