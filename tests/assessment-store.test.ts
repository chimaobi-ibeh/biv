import { describe, it, expect } from 'vitest';
import { deriveAssessmentId, StoredResponse } from '@/lib/assessment-store';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const responses: StoredResponse[] = [
  { questionId: 1, answer: 'A logistics app for Lagos traders' },
  { questionId: 2, answer: 'Yes', followUpAnswer: 'Twelve paying pilots' },
];

describe('deriveAssessmentId', () => {
  it('produces a valid v8 uuid Postgres will accept', () => {
    expect(deriveAssessmentId('founder@example.com', responses)).toMatch(
      UUID_RE
    );
  });

  it('is stable across calls, so a retry upserts instead of duplicating', () => {
    const first = deriveAssessmentId('founder@example.com', responses);
    const second = deriveAssessmentId('founder@example.com', responses);
    expect(first).toBe(second);
  });

  it('ignores email case and surrounding whitespace', () => {
    expect(deriveAssessmentId('  Founder@Example.com ', responses)).toBe(
      deriveAssessmentId('founder@example.com', responses)
    );
  });

  it('treats an absent follow-up and an empty one as the same answer', () => {
    const withUndefined: StoredResponse[] = [{ questionId: 1, answer: 'Yes' }];
    const withEmpty: StoredResponse[] = [
      { questionId: 1, answer: 'Yes', followUpAnswer: '' },
    ];
    expect(deriveAssessmentId('a@b.com', withUndefined)).toBe(
      deriveAssessmentId('a@b.com', withEmpty)
    );
  });

  it('separates different submissions', () => {
    const other: StoredResponse[] = [
      { questionId: 1, answer: 'A different idea entirely' },
    ];
    expect(deriveAssessmentId('founder@example.com', responses)).not.toBe(
      deriveAssessmentId('founder@example.com', other)
    );
  });

  it('separates two founders who answered identically', () => {
    expect(deriveAssessmentId('one@example.com', responses)).not.toBe(
      deriveAssessmentId('two@example.com', responses)
    );
  });

  it('handles a missing email without throwing', () => {
    expect(deriveAssessmentId(undefined, responses)).toMatch(UUID_RE);
  });
});
