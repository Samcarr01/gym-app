# TODO

## Todo
- [x] UI/UX overhaul: Performance Lab direction
  - [x] Define new visual system tokens (colors, gradients, surfaces, motion) in `src/styles/globals.css`
  - [x] Update typography + layout rules in `src/app/layout.tsx` and `tailwind.config.ts`
  - [x] Restyle core UI components (`src/components/ui/*`) to match new system
  - [x] Redesign landing page flow in `src/app/page.tsx`
  - [x] Redesign start page in `src/app/start/page.tsx`
  - [x] Questionnaire overhaul: mission framing + progress ring + fun micro-interactions in `src/components/QuestionnaireForm.tsx` and `src/components/StepIndicator.tsx`
  - [x] Questionnaire layout + sidebar preview updates in `src/app/questionnaire/page.tsx`
  - [x] Generate/plan view polish in `src/app/generate/page.tsx` and `src/components/PlanViewer.tsx`
  - [x] Motion pass (page-load, staggered reveals, reduced motion) across key screens

## Done
- Improve the plan-building loading UI to feel cleaner and more premium while AI is generating the plan.
- Improve sport-specific plans with power/conditioning/mixed structure.
- Avoid repeating the same main exercises across days (add variety).
- Expand nutrition guidance with calories, protein targets, and snack/meal timing.
