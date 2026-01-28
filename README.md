# AI Gym Plan Builder 🏋️

A lightweight web app that generates personalised gym routines based on a detailed questionnaire. Built for personal use and friends.

## What It Does

- **Build New Plan**: Answer a 9-section questionnaire about your goals, experience, equipment, injuries, and preferences. Get a complete workout plan tailored to you.
- **Update Existing Plan**: Paste your current workout and answer the questionnaire to get an updated version that respects your new constraints.

## Features

✅ No accounts or tracking  
✅ Injury-aware exercise selection  
✅ Equipment-specific alternatives  
✅ Copy-to-clipboard for easy export  
✅ Dark mode by default  
✅ Mobile responsive  

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **AI**: OpenAI GPT-5.2
- **Deployment**: Vercel
- **Database**: Optional Supabase (for persistence)

## Quick Start

```bash
# Clone the repo
git clone https://github.com/your-username/ai-gym-plan-builder.git
cd ai-gym-plan-builder

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your OPENAI_API_KEY

# Run locally
pnpm dev
```

Visit `http://localhost:3000` to use the app.

## Building with Claude Code

This project uses **ClaudeOps** methodology. To build from scratch:

1. Read `CLAUDE.md` for project overview
2. Follow prompts in `prompts/BUILD-CHAIN.md`
3. Execute prompts 01-08 in order

Each prompt generates specific components:
- `01-foundation` → Project scaffold
- `02-types` → TypeScript types
- `03-ui-base` → UI components
- `04-questionnaire` → Multi-step form
- `05-ai-engine` → OpenAI integration
- `06-api` → API route
- `07-plan-viewer` → Plan display
- `08-integration` → Final polish

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add `OPENAI_API_KEY` environment variable
4. Deploy

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anon key |

## Project Structure

```
├── CLAUDE.md                 # Project OS for Claude
├── ClaudeOps.json           # Build configuration
├── Claude-*.md              # Module documentation
├── prompts/                  # Build prompts
│   ├── BUILD-CHAIN.md       # Execution order
│   └── 01-08-*.md           # Individual prompts
└── src/
    ├── app/                 # Next.js pages
    ├── components/          # React components
    └── lib/                 # Utilities and types
```

## Questionnaire Sections

1. **Goals** – Primary/secondary fitness goals
2. **Experience** – Training history and level
3. **Availability** – Days per week, session duration
4. **Equipment** – Gym access and available equipment
5. **Injuries** – Current limitations (safety-critical)
6. **Recovery** – Sleep, stress, recovery capacity
7. **Nutrition** – Diet approach and restrictions
8. **Preferences** – Favourite exercises, training split
9. **Constraints** – Additional notes and limits

## Safety

- All plans include a healthcare disclaimer
- High-severity injuries automatically exclude related movements
- Conservative defaults for beginners

## License

MIT – Use it, modify it, share it with friends.

---

Built with ❤️ using Claude Code and ClaudeOps methodology.
