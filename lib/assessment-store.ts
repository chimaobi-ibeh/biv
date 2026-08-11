/**
 * Persistence for completed assessments.
 *
 * SERVER ONLY (imports lib/supabase, which holds the service role key).
 *
 * Every function here is best-effort and never throws: the user is waiting on
 * an analysis, and a database problem must not turn a working result into an
 * error page. Failures are logged and swallowed.
 */

import { createHash } from 'crypto';
import { getServiceClient } from './supabase';
import { AIRecommendation } from '@/types';

const TABLE = 'business_idea_assessments';

export interface StoredResponse {
  questionId: number;
  answer: string;
  followUpAnswer?: string;
}

export interface StoredProfile {
  name?: string;
  email?: string;
  industry?: string;
  location?: string;
  stage?: string;
}

export interface SaveAssessmentInput {
  responses: StoredResponse[];
  userProfile: StoredProfile;
  scoreLevel: string;
  totalPositive: number;
}

/**
 * Derive a stable id from the submission itself.
 *
 * The results page fires /api/analyze on load and again behind the "Try
 * Again" button, so the same assessment reaches us more than once. Hashing
 * the answers means every one of those attempts upserts the same row instead
 * of leaving duplicates behind, without handing the client an id it could
 * use to address someone else's record.
 *
 * Formatted as a v8 UUID so it fits the table's uuid primary key.
 */
export function deriveAssessmentId(
  email: string | undefined,
  responses: StoredResponse[]
): string {
  const canonical = JSON.stringify({
    email: (email || '').trim().toLowerCase(),
    responses: responses.map((r) => [
      r.questionId,
      r.answer.trim(),
      (r.followUpAnswer || '').trim(),
    ]),
  });

  const digest = createHash('sha256').update(canonical).digest('hex');
  const nibbles = digest.slice(0, 32).split('');

  // Pin the version and RFC 4122 variant bits so Postgres accepts it as a uuid.
  nibbles[12] = '8';
  nibbles[16] = ((parseInt(nibbles[16], 16) & 0x3) | 0x8).toString(16);

  const h = nibbles.join('');
  return [
    h.slice(0, 8),
    h.slice(8, 12),
    h.slice(12, 16),
    h.slice(16, 20),
    h.slice(20, 32),
  ].join('-');
}

/**
 * Write the assessment before the AI call runs, so the responses survive even
 * when the analysis times out, gets rate limited, or is refused.
 *
 * Returns the row id, or null if nothing was stored.
 */
export async function saveAssessment(
  input: SaveAssessmentInput
): Promise<string | null> {
  const client = getServiceClient();
  if (!client) return null;

  const { responses, userProfile, scoreLevel, totalPositive } = input;
  const id = deriveAssessmentId(userProfile.email, responses);

  try {
    const { error } = await client.from(TABLE).upsert(
      {
        id,
        // name and email are NOT NULL in the schema. The profile form makes
        // both required, but a direct API caller can omit them, and losing the
        // whole record over a missing name would defeat the point.
        name: userProfile.name || '',
        email: userProfile.email || '',
        industry: userProfile.industry || null,
        location: userProfile.location || null,
        stage: userProfile.stage || null,
        responses,
        score_level: scoreLevel,
        total_positive: totalPositive,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Failed to store assessment:', error.message);
      return null;
    }

    return id;
  } catch (err) {
    console.error('Failed to store assessment:', err);
    return null;
  }
}

/**
 * Attach the generated analysis to a row saved by saveAssessment.
 */
export async function attachRecommendation(
  id: string,
  recommendation: AIRecommendation
): Promise<void> {
  const client = getServiceClient();
  if (!client) return;

  try {
    const { error } = await client
      .from(TABLE)
      .update({ ai_recommendation: recommendation })
      .eq('id', id);

    if (error) {
      console.error('Failed to store AI recommendation:', error.message);
    }
  } catch (err) {
    console.error('Failed to store AI recommendation:', err);
  }
}
