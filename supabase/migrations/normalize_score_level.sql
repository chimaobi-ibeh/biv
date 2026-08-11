-- Normalize score_level onto the values the application actually computes.
-- Run this SQL in the Supabase SQL Editor.
--
-- Rows written before March 2026 by the (since deleted) /api/ratings endpoint
-- stored the display label: 'Green Light', 'Yellow Light', 'Red Light'.
-- lib/assessment-store.ts stores ScoreResult.level instead: 'green', 'yellow',
-- 'red'. Left alone the column carries both formats and cannot be grouped.
--
-- The label is a presentation concern: lib/pdf-document.tsx derives it from
-- the level at render time, and nothing in the app reads this column back.
--
-- Additive and idempotent: no table is dropped, and after the UPDATE runs
-- once, no rows match its WHERE clause again.

-- Step 1. Preview what will change. Expect only the three known labels.
--   SELECT score_level, count(*)
--   FROM business_idea_assessments
--   WHERE score_level IS NOT NULL
--   GROUP BY score_level
--   ORDER BY count(*) DESC;

-- Step 2. Map the known labels, and only those.
--
-- An explicit CASE rather than a string split: /api/ratings had no validation,
-- so this column may hold arbitrary caller-supplied text. Anything that is not
-- one of the three labels is left untouched rather than mangled into a new
-- bogus value.
UPDATE business_idea_assessments
SET score_level = CASE lower(trim(score_level))
      WHEN 'green light'  THEN 'green'
      WHEN 'yellow light' THEN 'yellow'
      WHEN 'red light'    THEN 'red'
    END
WHERE lower(trim(score_level)) IN ('green light', 'yellow light', 'red light');

COMMENT ON COLUMN business_idea_assessments.score_level IS 'Assessment score level: green, yellow or red. Matches ScoreResult.level in lib/scoring.ts. Null for rows that predate the column or never completed.';

-- Step 3. Check for leftovers the mapping did not cover.
--   SELECT DISTINCT score_level
--   FROM business_idea_assessments
--   WHERE score_level IS NOT NULL
--     AND score_level NOT IN ('green', 'yellow', 'red');
--
-- Step 4. ONLY if step 3 returned no rows, lock the column down so a future
-- writer cannot reintroduce a third format:
--
--   ALTER TABLE business_idea_assessments
--     ADD CONSTRAINT business_idea_assessments_score_level_check
--     CHECK (score_level IS NULL OR score_level IN ('green', 'yellow', 'red'));
--
-- Skip this if step 3 returned anything: the constraint validates existing
-- rows and will fail rather than silently accept them.
