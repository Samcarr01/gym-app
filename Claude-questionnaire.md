# Questionnaire Module – Purpose

Collect user inputs through a structured 9-section questionnaire to generate personalised gym plans.

## Features

### Multi-Step Form

#### Constraints
- **Must use React Hook Form with Zod validation**
- **Must persist state across steps (no data loss on back navigation)**
- **Must show progress indicator**
- *Should animate transitions between steps*

#### Sections

1. **Goals** – Primary fitness goal
2. **Experience** – Training history and current level
3. **Availability** – Days per week, session duration
4. **Equipment** – Gym access, home equipment
5. **Injuries** – Current limitations, past injuries
6. **Recovery** – Sleep, stress, recovery capacity
7. **Nutrition** – Current approach, dietary restrictions
8. **Preferences** – Favourite exercises, disliked movements
9. **Constraints** – Time limits, scheduling restrictions

### Section: Goals

#### Fields
- `primaryGoal`: enum – muscle_building | fat_loss | strength | endurance | general_fitness | sport_specific
- `secondaryGoal`: enum | null – same options
- `timeframe`: string – "3 months", "6 months", "1 year"
- `specificTargets`: string[] – optional targets like "increase bench press"

#### Validation
- **primaryGoal is required**
- *secondaryGoal must differ from primaryGoal if provided*

### Section: Experience

#### Fields
- `trainingYears`: number – 0 to 30
- `currentLevel`: enum – beginner | intermediate | advanced
- `recentTraining`: string – description of last 3 months
- `strongPoints`: string[] – muscle groups or movements
- `weakPoints`: string[] – areas needing work

#### Validation
- **currentLevel is required**
- **trainingYears must be non-negative**

### Section: Availability

#### Fields
- `daysPerWeek`: number – 1 to 7
- `sessionDuration`: number – minutes (30 to 180)
- `preferredDays`: string[] – ["Monday", "Wednesday", "Friday"]
- `timeOfDay`: enum – morning | afternoon | evening | flexible

#### Validation
- **daysPerWeek between 1 and 7**
- **sessionDuration between 30 and 180**

### Section: Equipment

#### Fields
- `gymAccess`: boolean
- `gymType`: enum | null – commercial | home | hotel | outdoor
- `availableEquipment`: string[] – barbells, dumbbells, cables, machines, etc.
- `limitedEquipment`: string[] – equipment with restrictions

#### Validation
- **gymAccess is required**
- *If gymAccess false, availableEquipment must have at least one item*

### Section: Injuries

#### Fields
- `currentInjuries`: InjuryRecord[] – { area: string, severity: low|medium|high, notes: string }
- `pastInjuries`: InjuryRecord[]
- `movementRestrictions`: string[] – "overhead pressing", "deep squats", etc.
- `painAreas`: string[] – general areas of discomfort

#### Validation
- **Injuries with high severity must have notes**
- *AI must avoid movements affecting injured areas*

### Section: Recovery

#### Fields
- `sleepHours`: number – average per night
- `sleepQuality`: enum – poor | fair | good | excellent
- `stressLevel`: enum – low | moderate | high | very_high
- `recoveryCapacity`: enum – low | moderate | high

#### Validation
- **sleepHours between 3 and 12**

### Section: Nutrition

#### Fields
- `nutritionApproach`: enum – maintenance | surplus | deficit | intuitive
- `proteinIntake`: enum – low | moderate | high | very_high
- `dietaryRestrictions`: string[] – vegetarian, vegan, allergies
- `supplementUse`: string[] – creatine, protein, etc.

### Section: Preferences

#### Fields
- `favouriteExercises`: string[]
- `dislikedExercises`: string[]
- `preferredSplit`: enum | null – full_body | upper_lower | push_pull_legs | bro_split | custom
- `cardioPreference`: enum – none | minimal | moderate | extensive

### Section: Constraints

#### Fields
- `maxExercisesPerSession`: number | null
- `timeConstraints`: string – "must finish by 7am"
- `otherNotes`: string – any additional context

## State Management

### Form State Shape

```typescript
interface QuestionnaireState {
  currentStep: number;
  completedSteps: number[];
  data: {
    goals: GoalsSection;
    experience: ExperienceSection;
    availability: AvailabilitySection;
    equipment: EquipmentSection;
    injuries: InjuriesSection;
    recovery: RecoverySection;
    nutrition: NutritionSection;
    preferences: PreferencesSection;
    constraints: ConstraintsSection;
  };
  mode: 'new' | 'update';
  existingPlan: string | null;
}
```

### Persistence
- **Store in localStorage during session**
- **Clear on successful generation**
- *Optional: persist to Supabase for retrieval*

## UI Components

### QuestionnaireForm.tsx

#### Props
- `mode`: 'new' | 'update'
- `onComplete`: (data: QuestionnaireData) => void

#### Behaviour
- Renders current step component
- Handles next/back navigation
- Validates before advancing
- Shows progress bar

### StepIndicator.tsx

#### Props
- `totalSteps`: number
- `currentStep`: number
- `completedSteps`: number[]

### Individual Step Components

Each section has its own component:
- `GoalsStep.tsx`
- `ExperienceStep.tsx`
- `AvailabilityStep.tsx`
- `EquipmentStep.tsx`
- `InjuriesStep.tsx`
- `RecoveryStep.tsx`
- `NutritionStep.tsx`
- `PreferencesStep.tsx`
- `ConstraintsStep.tsx`
