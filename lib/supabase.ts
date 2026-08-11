/**
 * Server-side Supabase client.
 *
 * SERVER ONLY. This module reads SUPABASE_SERVICE_ROLE_KEY, which bypasses
 * row-level security. Never import it from a 'use client' component or from
 * anything that ends up in the browser bundle.
 *
 * The anon key is deliberately not used here: restrict_assessment_rls_policies
 * revoked every grant on business_idea_assessments from the anon role, so a
 * browser-side insert cannot succeed and should not be reintroduced.
 *
 * The client is created lazily and the getter returns null when the
 * environment is not configured. Persistence is best-effort: a missing key
 * must degrade to "nothing is stored", never to a failed build or a 500 on a
 * request the user is waiting on.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cachedClient: SupabaseClient | null = null;
let warnedMissingConfig = false;

export function isPersistenceConfigured(): boolean {
  return Boolean(supabaseUrl && serviceRoleKey);
}

export function getServiceClient(): SupabaseClient | null {
  if (!supabaseUrl || !serviceRoleKey) {
    if (!warnedMissingConfig) {
      warnedMissingConfig = true;
      console.warn(
        'Supabase persistence disabled: set SUPABASE_URL (or ' +
          'NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY to store ' +
          'assessments.'
      );
    }
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return cachedClient;
}

// Table: business_idea_assessments
// See supabase/migrations/ for the authoritative schema. Columns written by
// lib/assessment-store.ts:
// - id (uuid, primary key)            - deterministic, see deriveAssessmentId
// - name, email (text, NOT NULL)
// - industry, location, stage (text)
// - responses (jsonb)                 - [{questionId, answer, followUpAnswer}]
// - score_level (text), total_positive (integer)
// - ai_recommendation (jsonb)         - filled in once the analysis returns
// - created_at, completed_at (timestamptz)
