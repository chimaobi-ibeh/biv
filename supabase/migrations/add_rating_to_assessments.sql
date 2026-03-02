-- Add rating columns to the existing business_idea_assessments table
-- Run this SQL in the Supabase SQL Editor

ALTER TABLE business_idea_assessments
  ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  ADD COLUMN IF NOT EXISTS rating_label TEXT,
  ADD COLUMN IF NOT EXISTS score_level TEXT,
  ADD COLUMN IF NOT EXISTS total_positive INTEGER;

-- Index for querying by rating
CREATE INDEX IF NOT EXISTS idx_business_idea_assessments_rating
  ON business_idea_assessments(rating);

COMMENT ON COLUMN business_idea_assessments.rating IS 'User star rating of their result (1-5)';
COMMENT ON COLUMN business_idea_assessments.rating_label IS 'Human-readable label for the rating';
COMMENT ON COLUMN business_idea_assessments.score_level IS 'Assessment score level (Green Light, Yellow Light, etc.)';
COMMENT ON COLUMN business_idea_assessments.total_positive IS 'Number of positive indicators (0-10)';
