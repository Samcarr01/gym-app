# DB Module – Purpose

Optional persistence layer using Supabase PostgreSQL for storing generated plans.

## Features

### Database Schema (Optional)

#### Constraints
- **Schema is optional – app works without it**
- **No user authentication required**
- **Use anonymous session IDs for retrieval**
- *Consider adding if users want to retrieve past plans*

### Tables

#### plans

```sql
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_data JSONB NOT NULL,
  questionnaire_data JSONB NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('new', 'update')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plans_session_id ON plans(session_id);
CREATE INDEX idx_plans_created_at ON plans(created_at DESC);
```

#### questionnaire_responses (Optional)

```sql
CREATE TABLE questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  response_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_responses_session_id ON questionnaire_responses(session_id);
```

### Session ID Strategy

#### No Authentication Approach

Generate a random session ID on first visit and store in localStorage:

```typescript
// lib/session.ts
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('gym-plan-session-id');
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('gym-plan-session-id', sessionId);
  }
  
  return sessionId;
}
```

### Supabase Client

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Database Operations

#### Save Plan

```typescript
// lib/db.ts
export async function savePlan(
  sessionId: string,
  plan: GeneratedPlan,
  questionnaire: QuestionnaireData,
  mode: 'new' | 'update'
): Promise<string | null> {
  const { data, error } = await supabase
    .from('plans')
    .insert({
      session_id: sessionId,
      plan_name: plan.planName,
      plan_data: plan,
      questionnaire_data: questionnaire,
      mode
    })
    .select('id')
    .single();
  
  if (error) {
    console.error('Failed to save plan:', error);
    return null;
  }
  
  return data.id;
}
```

#### Get Recent Plans

```typescript
export async function getRecentPlans(
  sessionId: string,
  limit: number = 5
): Promise<PlanSummary[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('id, plan_name, mode, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Failed to get plans:', error);
    return [];
  }
  
  return data;
}
```

#### Get Plan By ID

```typescript
export async function getPlanById(
  planId: string
): Promise<StoredPlan | null> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('id', planId)
    .single();
  
  if (error) {
    console.error('Failed to get plan:', error);
    return null;
  }
  
  return {
    id: data.id,
    planName: data.plan_name,
    plan: data.plan_data as GeneratedPlan,
    questionnaire: data.questionnaire_data as QuestionnaireData,
    mode: data.mode,
    createdAt: data.created_at
  };
}
```

### Row Level Security (Optional)

If using RLS for additional security:

```sql
-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (anon key)
CREATE POLICY "Anyone can insert plans"
  ON plans FOR INSERT
  WITH CHECK (true);

-- Only allow reading own plans (by session_id from header or param)
CREATE POLICY "Read own plans"
  ON plans FOR SELECT
  USING (true);  -- For friends-only, keep it simple
```

### Types

```typescript
// lib/types.ts
export interface StoredPlan {
  id: string;
  planName: string;
  plan: GeneratedPlan;
  questionnaire: QuestionnaireData;
  mode: 'new' | 'update';
  createdAt: string;
}

export interface PlanSummary {
  id: string;
  plan_name: string;
  mode: 'new' | 'update';
  created_at: string;
}
```

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Migration

#### Initial Setup

1. Create new Supabase project
2. Run schema SQL in SQL editor
3. Copy URL and anon key to .env.local
4. Test connection

### Cleanup (Optional)

Auto-delete old plans after 30 days:

```sql
-- Run as a scheduled function or cron job
DELETE FROM plans
WHERE created_at < NOW() - INTERVAL '30 days';
```

### Without Database

The app works without any database:
- Questionnaire data passed via URL params or localStorage
- Plan displayed immediately after generation
- No persistence between sessions
- User must regenerate if they close the browser

This is the **recommended approach** for the MVP.
