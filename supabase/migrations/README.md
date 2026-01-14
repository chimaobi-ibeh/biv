# Database Setup Instructions

## Setting Up the Business Idea Assessments Table

Follow these steps to set up the database for storing all 10 assessment questions:

### 1. Access Supabase SQL Editor

1. Go to your Supabase project at https://supabase.com
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Run the Migration

Copy and paste the contents of `create_business_idea_assessments.sql` into the SQL Editor and click **Run**.

This will create:
- A new table `business_idea_assessments` with JSONB storage for all responses
- Proper indexes for performance
- Row Level Security (RLS) policies for public access
- Generated columns for quick access to key answers

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

The table has Row Level Security (RLS) enabled with public policies that allow:
- ✅ Anyone can insert (create) assessments
- ✅ Anyone can read assessments
- ✅ Anyone can update assessments

If you need to restrict access later, you can modify the policies in the Supabase Dashboard under **Authentication > Policies**.
