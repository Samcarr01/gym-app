# Configuration Guide

## Environment Variables

### `.env.local` (Required for local development)

Create this file in the project root:

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

**How to get your OpenAI API key:**
1. Go to https://platform.openai.com
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy and paste into `.env.local`

**Important:**
- This file is already in `.gitignore` and won't be committed
- Never share your API key publicly
- For Vercel deployment, add as environment variable in dashboard

---

## AI Knowledge Base & Prompts

All AI behavior is defined in **`src/lib/prompts.ts`**

### 1. System Instructions (Lines 3-57)

This defines the AI's personality and rules:

```typescript
const SYSTEM_INSTRUCTIONS = `You are an expert strength and conditioning coach...`
```

**What you can customize:**
- AI personality and tone
- Core principles (SAFE, EFFECTIVE, etc.)
- Critical rules and safety guidelines
- Output format requirements

**Example customizations:**
```typescript
// Make it more aggressive/intense
"Your tone is intense and motivational. Push users to their limits."

// Add specialization
"You specialize in powerlifting and strength training."

// Change output format
// Add new fields to the JSON structure
```

### 2. Update Mode Instructions (Lines 59-74)

Defines how the AI handles existing plan updates:

```typescript
const UPDATE_MODE_PROMPT = `The user has an existing plan...`
```

**Customize to:**
- Change update priorities
- Add specific update rules
- Modify how existing plans are preserved

### 3. Injury-to-Movement Mapping (Lines 76-87)

Safety rules that prevent dangerous exercises:

```typescript
const INJURY_MOVEMENT_MAP: Record<string, string[]> = {
  'lower back': ['deadlift', 'bent over row', 'good morning', ...],
  'shoulder': ['overhead press', 'lateral raise', ...],
  'knee': ['squat', 'lunge', 'leg extension', ...],
  // Add more...
}
```

**How to add new injury mappings:**
```typescript
'lower back': ['deadlift', 'bent over row', 'good morning', 'back squat', 'romanian deadlift'],
'rotator cuff': ['overhead press', 'lateral raise', 'upright row'], // NEW
'achilles': ['calf raise', 'jump rope', 'running', 'box jumps'],    // NEW
```

### 4. User Profile Formatting (Lines 89+)

How questionnaire data is presented to the AI:

```typescript
export function buildPrompt(questionnaire: QuestionnaireData, existingPlan?: string) {
  // Formats all user data into a prompt
}
```

**Customize to:**
- Add new sections from questionnaire
- Change how data is formatted
- Add context or emphasis to certain fields

---

## AI Model Configuration

Located in **`src/lib/openai.ts`**:

```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4o',           // Change model here
  temperature: 0.7,          // Creativity (0.0-2.0)
  max_tokens: 4000,          // Response length limit
  response_format: { type: 'json_object' }
});
```

**Available models:**
- `gpt-4o` - Latest, fastest GPT-4 (recommended)
- `gpt-4-turbo` - Previous version
- `gpt-3.5-turbo` - Cheaper, faster, less capable

**Temperature guide:**
- `0.0-0.3` - Very consistent, conservative
- `0.4-0.7` - Balanced (current: 0.7)
- `0.8-1.0` - More creative and varied
- `1.0-2.0` - Very creative, less predictable

**Max tokens:**
- Current: `4000` tokens (~3000 words)
- Increase if plans are getting cut off
- Decrease to reduce API costs

---

## Adding More Knowledge

### Option 1: Expand System Instructions

Add specific knowledge directly to the prompt:

```typescript
const SYSTEM_INSTRUCTIONS = `You are an expert strength and conditioning coach...

EXERCISE LIBRARY:
- Compound movements: Squat, Deadlift, Bench Press, Overhead Press
- Accessory movements: Bicep Curls, Tricep Extensions, Lateral Raises
- Cardio options: Running, Cycling, Rowing, Swimming

TRAINING PRINCIPLES:
1. Progressive Overload - Gradually increase weight/volume
2. Specificity - Train movements specific to goals
3. Recovery - Allow adequate rest between sessions
...
`;
```

### Option 2: Add Reference Documents

Create additional context files:

```typescript
// src/lib/exercise-library.ts
export const EXERCISE_DATABASE = {
  compound: ['squat', 'deadlift', 'bench press', ...],
  isolation: ['bicep curl', 'tricep extension', ...],
  equipment: {
    barbell: ['back squat', 'deadlift', ...],
    dumbbell: ['dumbbell press', 'dumbbell row', ...],
  }
};

// Import and add to prompt
import { EXERCISE_DATABASE } from './exercise-library';
```

### Option 3: Add Training Methodologies

```typescript
const TRAINING_METHODS = `
PROGRESSIVE OVERLOAD METHODS:
1. Linear Progression - Add 5-10lbs per week
2. Wave Loading - Vary intensity weekly
3. Deload Weeks - Every 4th week reduce volume by 40%

PROGRAM STRUCTURES:
- 5x5 for strength (Stronglifts, Starting Strength)
- 5/3/1 for intermediate lifters
- PPL (Push/Pull/Legs) for bodybuilding
- Upper/Lower split for balance
`;

// Add to system instructions
const SYSTEM_INSTRUCTIONS = `${BASE_INSTRUCTIONS}\n\n${TRAINING_METHODS}`;
```

---

## Examples of Common Customizations

### Make Plans More Beginner-Friendly

In `src/lib/prompts.ts`:

```typescript
CRITICAL RULES:
- Default to conservative volume for beginners (CURRENT)
- Start with bodyweight or light weights for new trainees (ADD)
- Focus on form and technique over weight (ADD)
- Limit to 3-4 exercises per session for beginners (ADD)
```

### Add Sport-Specific Training

```typescript
const SPORT_SPECIFIC_PROGRAMS = `
BASKETBALL:
- Vertical jump training
- Agility drills
- Court sprint conditioning

POWERLIFTING:
- Competition lift focus (Squat, Bench, Deadlift)
- Accessory work for weak points
- Periodized peaking program
`;
```

### Add Nutrition Guidance

```typescript
NUTRITION GUIDELINES:
- Muscle building: 250-500 calorie surplus
- Fat loss: 300-500 calorie deficit
- Protein: 0.8-1g per lb bodyweight
- Carbs: Time around workouts for performance
- Fats: 20-30% of total calories
```

---

## Testing Your Changes

After modifying prompts:

1. **Test with sample data:**
   ```bash
   npm run dev
   ```

2. **Complete the questionnaire with different profiles:**
   - Beginner with injuries
   - Advanced lifter
   - Limited equipment (home gym)
   - Sport-specific goals

3. **Check the generated plans match your expectations**

4. **Verify safety rules work:**
   - Add high-severity injury
   - Confirm restricted exercises are excluded

---

## File Locations Summary

| What | File | Purpose |
|------|------|---------|
| API Key | `.env.local` | OpenAI authentication |
| System Instructions | `src/lib/prompts.ts` (line 3) | AI personality & rules |
| Injury Mapping | `src/lib/prompts.ts` (line 76) | Safety exclusions |
| Model Config | `src/lib/openai.ts` (line 15) | Model, temperature, tokens |
| Output Schema | `src/lib/types.ts` | Plan structure validation |

---

## Need More Help?

- **OpenAI Documentation**: https://platform.openai.com/docs
- **Prompt Engineering Guide**: https://platform.openai.com/docs/guides/prompt-engineering
- **Model Pricing**: https://openai.com/pricing

---

**Quick Start:**
1. Add your OpenAI key to `.env.local`
2. Run `npm run dev`
3. Test the app
4. Customize prompts in `src/lib/prompts.ts`
5. Restart dev server to see changes
