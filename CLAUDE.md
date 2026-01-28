# AI Gym Plan Builder – Objective

Generate personalised gym routines from a detailed questionnaire or update existing plans. No tracking, no analytics, no complexity. Users get a plan they can actually follow.

## Modules

- **Questionnaire** – [Claude-questionnaire.md](Claude-questionnaire.md)
- **AI** – [Claude-ai.md](Claude-ai.md)
- **UI** – [Claude-ui.md](Claude-ui.md)
- **API** – [Claude-api.md](Claude-api.md)
- **DB** – [Claude-db.md](Claude-db.md)

## Global Constraints

1. **Stack is fixed: Next.js (App Router) + Supabase + Vercel**
2. **Use Tailwind CSS with dark mode default**
3. **All AI calls use GPT-5.2 via OpenAI SDK**
4. **No user accounts or authentication**
5. **No workout tracking or progress logging**
6. **Keep files under 50 KB each**
7. *Prefer shadcn/ui components where available*
8. *Use TypeScript throughout*

## Architecture

```
Landing → Mode Select → Questionnaire → [Optional: Paste Existing Plan] → Generate → View Plan → Copy
```

### Single Critical Path

No side paths. No background jobs. No caching. One flow.

## Metadata

```json
{
  "stack": "Next.js 14 + Supabase + Vercel",
  "ai_model": "gpt-5.2",
  "version": "1.0.0",
  "environments": ["local", "prod"],
  "audience": "personal + friends"
}
```

## Environment Variables

```
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

## File Structure

```
src/
├── app/
│   ├── page.tsx              # Landing + mode selection
│   ├── questionnaire/
│   │   └── page.tsx          # Multi-step questionnaire
│   ├── generate/
│   │   └── page.tsx          # Generation + plan viewer
│   └── api/
│       └── generate-plan/
│           └── route.ts      # AI endpoint
├── components/
│   ├── ui/                   # shadcn components
│   ├── ModeSelector.tsx
│   ├── QuestionnaireForm.tsx
│   ├── ExistingPlanInput.tsx
│   ├── PlanViewer.tsx
│   └── WorkoutDay.tsx
├── lib/
│   ├── openai.ts             # OpenAI client
│   ├── prompts.ts            # System instructions
│   └── types.ts              # TypeScript types
└── styles/
    └── globals.css
```

## Safety Disclaimer

All generated plans include: "Consult a healthcare professional before starting any exercise program."
