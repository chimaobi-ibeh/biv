# Database Setup Instructions

## Setting Up the Business Idea Assessments Table

Follow these steps to set up the database for storing all 10 assessment questions:

### 1. Access Supabase SQL Editor

1. Go to your Supabase project at https://supabase.com
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Run the Migrations

> **The live project is already set up. Do not run
> `create_business_idea_assessments.sql` against it.** That file starts with
> `DROP TABLE ... CASCADE` and will destroy every stored assessment. It is the
> original bootstrap, kept for reference and for standing up a fresh project.

Run these in order in the SQL Editor. All of them after the first are additive
and safe to re-run:

| Order | File | What it does |
| --- | --- | --- |
| 1 | `create_business_idea_assessments.sql` | Creates the table, indexes and generated columns. **New projects only.** |
| 2 | `add_rating_to_assessments.sql` | Adds `rating`, `rating_label`, `score_level`, `total_positive`. |
| 3 | `restrict_assessment_rls_policies.sql` | Drops the public read/write policies and revokes the anon grants. |
| 4 | `add_ai_recommendation_to_assessments.sql` | Adds `ai_recommendation` and `stage`. |
| 5 | `normalize_score_level.sql` | Rewrites legacy `'Green Light'` values as `'green'`. |

After step 3, the anon key can no longer touch this table by design. Writes
come from the server in `lib/assessment-store.ts`, which uses
`SUPABASE_SERVICE_ROLE_KEY` and bypasses RLS. Set that variable in `.env` and
in your hosting environment, or nothing is stored.

### 3. Verify the Table

Run this query to verify the table was created successfully:

```sql
SELECT * FROM business_idea_assessments LIMIT 5;
```

## Table Structure

The table stores:

### User Profile
- `name` - User's full name
- `email` - User's email address
- `industry` - User's industry (optional)
- `location` - User's location (optional)

### Assessment Data
- `responses` - JSONB array containing all 10 question responses
  - Format: `[{"questionId": 1, "answer": "...", "followUpAnswer": "..."}, ...]`
- `created_at` - When the assessment was started
- `completed_at` - When the assessment was completed

### Example Response Data

```json
[
  {
    "questionId": 1,
    "answer": "all-three",
    "followUpAnswer": null
  },
  {
    "questionId": 2,
    "answer": "I help small business owners increase sales by implementing proven digital marketing strategies"
  },
  {
    "questionId": 3,
    "answer": "yes-confirmed"
  }
  // ... up to 10 questions
]
```

## Querying the Data

### Get all assessments
```sql
SELECT * FROM business_idea_assessments ORDER BY created_at DESC;
```

### Get assessments by email
```sql
SELECT * FROM business_idea_assessments WHERE email = 'user@example.com';
```

### Query specific responses
```sql
SELECT
  name,
  email,
  responses->0->>'answer' as foundation_answer,
  responses->1->>'answer' as value_creation,
  completed_at
FROM business_idea_assessments
WHERE completed_at IS NOT NULL;
```

## Security

Row Level Security is enabled and **no policies remain**, so the anon key
matches nothing and is denied by default. The underlying table grants were
revoked from the `anon` role as well, in `restrict_assessment_rls_policies.sql`.

- ❌ The anon key cannot insert, read or update
- ✅ The server writes with `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS

This matters because the table holds names, emails and the free-text
assessment answers. The original `USING (true)` policies made all of that
readable and tamperable by anyone holding the anon key, which ships in the
browser bundle.

Keep the service role key server-side only. It must never appear in a
`NEXT_PUBLIC_*` variable or be imported from a `'use client'` component.
