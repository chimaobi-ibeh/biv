-- Create the business_idea_assessments table to store all 10 questions
-- Run this SQL in the Supabase SQL Editor

-- Drop table if it exists (use with caution in production)
DROP TABLE IF EXISTS business_idea_assessments CASCADE;

-- Create the table
CREATE TABLE business_idea_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- User profile information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  industry TEXT,
  location TEXT,

  -- Question responses stored as JSONB for flexibility
  -- This allows us to store all 10 questions with their answers and follow-ups
  responses JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Optional: Extract key answers for easier querying
  foundation_answer TEXT GENERATED ALWAYS AS (
    responses->0->>'answer'
  ) STORED,

  value_creation_answer TEXT GENERATED ALWAYS AS (
    responses->1->>'answer'
  ) STORED,

  market_validation_answer TEXT GENERATED ALWAYS AS (
    responses->2->>'answer'
  ) STORED
);

-- Create indexes for better performance
CREATE INDEX idx_business_idea_assessments_email ON business_idea_assessments(email);
CREATE INDEX idx_business_idea_assessments_created_at ON business_idea_assessments(created_at DESC);
CREATE INDEX idx_business_idea_assessments_completed_at ON business_idea_assessments(completed_at DESC);

-- GIN index for JSONB queries
CREATE INDEX idx_business_idea_assessments_responses_gin ON business_idea_assessments USING gin (responses);

-- Enable Row Level Security (RLS)
ALTER TABLE business_idea_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
-- Policy: Allow anyone to insert their assessment
CREATE POLICY "Allow public insert" ON business_idea_assessments
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Allow anyone to read assessments
CREATE POLICY "Allow public read" ON business_idea_assessments
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow anyone to update assessments
CREATE POLICY "Allow public update" ON business_idea_assessments
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE business_idea_assessments IS 'Stores business idea assessment responses with all 10 questions and follow-ups in JSONB format';
COMMENT ON COLUMN business_idea_assessments.responses IS 'Array of question responses in format: [{"questionId": 1, "answer": "...", "followUpAnswer": "..."}]';
