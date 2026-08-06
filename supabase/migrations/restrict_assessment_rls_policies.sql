-- Remove the public read/write policies on business_idea_assessments.
-- Run this SQL in the Supabase SQL Editor.
--
-- The original policies were all `USING (true)` for the `public` role, which
-- let any holder of the anon key SELECT, INSERT or UPDATE every row through
-- the Supabase REST API without going through this app. The table stores
-- name, email, industry, location and the free-text assessment responses,
-- so that was a full read and tamper primitive over all user data.
--
-- Nothing in the application uses the anon key against this table: there is
-- no client-side Supabase client, and no insert path anywhere in the codebase.
-- Server-side code that needs access should use the service role key, which
-- bypasses RLS and is unaffected by everything below.
--
-- This migration is additive and does NOT drop or recreate the table.

DROP POLICY IF EXISTS "Allow public insert" ON business_idea_assessments;
DROP POLICY IF EXISTS "Allow public read"   ON business_idea_assessments;
DROP POLICY IF EXISTS "Allow public update" ON business_idea_assessments;

-- Belt and braces: RLS only applies to the anon/authenticated roles, so also
-- take away the underlying table grants the anon key relies on.
REVOKE ALL ON business_idea_assessments FROM anon;

-- RLS stays on. With no policies present, anon and authenticated requests
-- match nothing and are denied by default.
ALTER TABLE business_idea_assessments ENABLE ROW LEVEL SECURITY;

-- If you later discover a service outside this repo that submits assessments
-- with the anon key, re-grant insert only -- never select or update, since
-- those are what expose and allow tampering with other people's records:
--
--   GRANT INSERT ON business_idea_assessments TO anon;
--   CREATE POLICY "Allow anonymous submit" ON business_idea_assessments
--     FOR INSERT TO anon WITH CHECK (true);
