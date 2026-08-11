-- Columns needed by lib/assessment-store.ts.
-- Run this SQL in the Supabase SQL Editor.
--
-- Additive only: this does NOT drop or recreate business_idea_assessments,
-- and it is safe to run more than once.

ALTER TABLE business_idea_assessments
  ADD COLUMN IF NOT EXISTS ai_recommendation JSONB,
  ADD COLUMN IF NOT EXISTS stage TEXT;

COMMENT ON COLUMN business_idea_assessments.ai_recommendation IS 'Generated analysis: strengths, gaps, personalizedPlan, weeklyRoadmap, resources, riskAssessment. Null when the assessment was stored but the analysis failed.';
COMMENT ON COLUMN business_idea_assessments.stage IS 'Self-reported stage of the business idea, from the profile form';

-- Rows are written by the server with the service role key, which bypasses
-- RLS, so no policy or grant changes are needed here. The anon role stays
-- locked out, per restrict_assessment_rls_policies.sql.

-- Assessments that were stored but never got an analysis attached:
--   SELECT id, email, score_level, created_at
--   FROM business_idea_assessments
--   WHERE ai_recommendation IS NULL
--   ORDER BY created_at DESC;
