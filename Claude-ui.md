# UI Module – Purpose

Render a clean, dark-mode interface for questionnaire input and plan display.

## Features

### Design System

#### Constraints
- **Must use Tailwind CSS**
- **Must default to dark mode**
- **Must use shadcn/ui components**
- **Must be mobile-responsive**
- *Should use Inter or system fonts*
- *Should animate interactions subtly*

#### Colour Palette

```css
/* Dark mode defaults */
--background: 224 71% 4%;        /* Near black */
--foreground: 213 31% 91%;       /* Light grey */
--card: 224 71% 6%;              /* Slightly lighter */
--card-foreground: 213 31% 91%;
--primary: 142 76% 36%;          /* Green accent */
--primary-foreground: 355 100% 97%;
--secondary: 215 28% 17%;        /* Muted blue-grey */
--muted: 223 47% 11%;
--accent: 216 34% 17%;
--destructive: 0 63% 31%;        /* Red for errors */
--border: 216 34% 17%;
--input: 216 34% 17%;
--ring: 142 76% 36%;
```

### Landing Page

#### Layout
- Full viewport height
- Centered content
- App title and tagline
- Mode selection cards

#### Components

```tsx
// app/page.tsx
export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            AI Gym Plan Builder
          </h1>
          <p className="text-muted-foreground text-lg">
            Get a personalised workout plan in minutes
          </p>
        </header>
        
        <ModeSelector />
      </div>
    </main>
  );
}
```

### ModeSelector Component

#### Props
None – self-contained with navigation

#### Behaviour
- Two cards: "Build New Plan" and "Update Existing Plan"
- On selection, navigate to /questionnaire with mode param

#### Structure

```tsx
interface ModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

function ModeCard({ title, description, icon, href }: ModeCardProps) {
  return (
    <Link href={href}>
      <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <h2 className="font-semibold text-lg">{title}</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {description}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
```

### Questionnaire Page

#### Layout
- Progress bar at top
- Current step content
- Navigation buttons at bottom

#### Components

```tsx
// app/questionnaire/page.tsx
export default function QuestionnairePage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') as 'new' | 'update';
  
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <QuestionnaireForm mode={mode} />
      </div>
    </main>
  );
}
```

### QuestionnaireForm Component

#### State
- Current step index
- Form data (React Hook Form)
- Validation errors

#### Navigation Logic
- **Back**: Go to previous step, preserve data
- **Next**: Validate current step, advance if valid
- **Submit**: On final step, validate all, navigate to /generate

### Step Components Pattern

Each step follows this pattern:

```tsx
interface StepProps {
  form: UseFormReturn<QuestionnaireData>;
}

function GoalsStep({ form }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">What are your goals?</h2>
        <p className="text-muted-foreground">
          Tell us what you want to achieve
        </p>
      </div>
      
      <FormField
        control={form.control}
        name="goals.primaryGoal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary Goal</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select your main goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="muscle_building">Build Muscle</SelectItem>
                <SelectItem value="fat_loss">Lose Fat</SelectItem>
                <SelectItem value="strength">Get Stronger</SelectItem>
                <SelectItem value="endurance">Improve Endurance</SelectItem>
                <SelectItem value="general_fitness">General Fitness</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Additional fields... */}
    </div>
  );
}
```

### ExistingPlanInput Component

#### For Update Mode Only

```tsx
function ExistingPlanInput({ form }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Your Current Plan</h2>
        <p className="text-muted-foreground">
          Paste your existing workout plan below
        </p>
      </div>
      
      <FormField
        control={form.control}
        name="existingPlan"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Existing Plan</FormLabel>
            <Textarea
              placeholder="Paste your current workout plan here..."
              className="min-h-[300px] font-mono text-sm"
              {...field}
            />
            <FormDescription>
              Include exercises, sets, reps, and any other details
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
```

### Generation Page

#### States
1. **Loading**: Show progress animation
2. **Success**: Show plan viewer
3. **Error**: Show error message with retry

#### Layout

```tsx
// app/generate/page.tsx
export default function GeneratePage() {
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  
  // Fetch on mount...
  
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {state === 'loading' && <GeneratingState />}
        {state === 'success' && plan && <PlanViewer plan={plan} />}
        {state === 'error' && <ErrorState onRetry={handleRetry} />}
      </div>
    </main>
  );
}
```

### GeneratingState Component

```tsx
function GeneratingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Building your plan...</h2>
        <p className="text-muted-foreground">
          This usually takes 10-20 seconds
        </p>
      </div>
    </div>
  );
}
```

### PlanViewer Component

#### Props
- `plan`: GeneratedPlan

#### Features
- Plan overview header
- Collapsible workout days
- Copy to clipboard button
- Print-friendly view

#### Structure

```tsx
function PlanViewer({ plan }: { plan: GeneratedPlan }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-4">
        <h1 className="text-3xl font-bold">{plan.planName}</h1>
        <p className="text-muted-foreground">{plan.overview}</p>
        <Badge variant="secondary">{plan.weeklyStructure}</Badge>
      </header>
      
      {/* Actions */}
      <div className="flex gap-3">
        <CopyButton plan={plan} />
        <Button variant="outline" onClick={() => window.print()}>
          Print
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Start Over</Link>
        </Button>
      </div>
      
      {/* Workout Days */}
      <div className="space-y-4">
        {plan.days.map((day) => (
          <WorkoutDay key={day.dayNumber} day={day} />
        ))}
      </div>
      
      {/* Additional Notes */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Progression</h3>
          <p className="text-sm text-muted-foreground">
            {plan.progressionGuidance}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Nutrition</h3>
          <p className="text-sm text-muted-foreground">
            {plan.nutritionNotes}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Recovery</h3>
          <p className="text-sm text-muted-foreground">
            {plan.recoveryNotes}
          </p>
        </Card>
      </div>
      
      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center">
        {plan.disclaimer}
      </p>
    </div>
  );
}
```

### WorkoutDay Component

#### Props
- `day`: WorkoutDayData

#### Features
- Collapsible accordion
- Exercise list with details
- Warmup and cooldown sections

```tsx
function WorkoutDay({ day }: { day: WorkoutDayData }) {
  return (
    <Collapsible>
      <Card>
        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-primary">
              Day {day.dayNumber}
            </span>
            <div>
              <h3 className="font-semibold text-left">{day.name}</h3>
              <p className="text-sm text-muted-foreground">{day.focus}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{day.duration}</Badge>
            <ChevronDown className="h-4 w-4" />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            {/* Warmup */}
            <WarmupSection warmup={day.warmup} />
            
            {/* Exercises */}
            <div className="space-y-3">
              {day.exercises.map((exercise, idx) => (
                <ExerciseCard key={idx} exercise={exercise} />
              ))}
            </div>
            
            {/* Cooldown */}
            <CooldownSection cooldown={day.cooldown} />
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
```

### ExerciseCard Component

```tsx
function ExerciseCard({ exercise }: { exercise: ExerciseData }) {
  return (
    <div className="p-3 rounded-lg bg-muted/50 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{exercise.name}</h4>
        <span className="text-sm font-mono">
          {exercise.sets} × {exercise.reps}
        </span>
      </div>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>Rest: {exercise.rest}</p>
        <p className="italic">{exercise.intent}</p>
        {exercise.notes && <p>💡 {exercise.notes}</p>}
      </div>
      {exercise.substitutions.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Alternatives: {exercise.substitutions.join(', ')}
        </p>
      )}
    </div>
  );
}
```

### CopyButton Component

```tsx
function CopyButton({ plan }: { plan: GeneratedPlan }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    const text = formatPlanAsText(plan);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Button onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
      {copied ? 'Copied!' : 'Copy Plan'}
    </Button>
  );
}
```

### Responsive Behaviour

#### Breakpoints
- **Mobile (< 640px)**: Single column, full-width cards
- **Tablet (640-1024px)**: Slight padding increase
- **Desktop (> 1024px)**: Max width container, comfortable spacing

#### Mobile Optimisations
- Larger touch targets (min 44px)
- Collapsible sections default closed
- Sticky navigation buttons
