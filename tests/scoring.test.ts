import { describe, it, expect } from 'vitest';
import {
  calculateScore,
  calculateDimensionScores,
  generateShareText,
} from '@/lib/scoring';
import { AssessmentResponse } from '@/types';

/** Answers that score a positive point on every one of the 10 questions. */
const allPositive: AssessmentResponse[] = [
  { questionId: 1, answer: 'all-three' },
  { questionId: 2, answer: 'I help small business owners increase sales by running ads' },
  { questionId: 3, answer: 'yes-confirmed' },
  { questionId: 4, answer: 'under-100' },
  { questionId: 5, answer: 'yes-regularly' },
  { questionId: 6, answer: 'yes-ready' },
  { questionId: 7, answer: 'both' },
  { questionId: 8, answer: 'Acme Inc (acme.com)' },
  { questionId: 9, answer: 'start-imperfect' },
  { questionId: 10, answer: 'yes' },
];

/** Answers that score zero points on every question. */
const allNegative: AssessmentResponse[] = [
  { questionId: 1, answer: 'missing-multiple' },
  { questionId: 2, answer: 'short' },
  { questionId: 3, answer: 'no-validation' },
  { questionId: 4, answer: 'over-1000' },
  { questionId: 5, answer: 'no' },
  { questionId: 6, answer: 'months' },
  { questionId: 7, answer: 'neither' },
  { questionId: 8, answer: 'no' },
  { questionId: 9, answer: 'perfect-first' },
  { questionId: 10, answer: 'no' },
];

/** Take the all-positive set and downgrade the first `count` answers. */
function withNegatives(count: number): AssessmentResponse[] {
  return allPositive.map((r, i) => (i < count ? allNegative[i] : r));
}

describe('calculateScore', () => {
  it('gives a perfect green score when every answer is positive', () => {
    const result = calculateScore(allPositive);

    expect(result.totalPositive).toBe(10);
    expect(result.score).toBe(100);
    expect(result.level).toBe('green');
    expect(result.title).toContain('GREEN LIGHT');
  });

  it('gives a zero red score when every answer is negative', () => {
    const result = calculateScore(allNegative);

    expect(result.totalPositive).toBe(0);
    expect(result.score).toBe(0);
    expect(result.level).toBe('red');
    expect(result.title).toContain('RED LIGHT');
  });

  it('uses 8 as the green threshold and 5 as the yellow threshold', () => {
    expect(calculateScore(withNegatives(2)).level).toBe('green'); // 8 positive
    expect(calculateScore(withNegatives(3)).level).toBe('yellow'); // 7 positive
    expect(calculateScore(withNegatives(5)).level).toBe('yellow'); // 5 positive
    expect(calculateScore(withNegatives(6)).level).toBe('red'); // 4 positive
  });

  it('scores text questions on length, not on content', () => {
    const tooShort = calculateScore([
      { questionId: 2, answer: 'I help people' }, // 13 chars, needs > 20
    ]);
    const longEnough = calculateScore([
      { questionId: 2, answer: 'I help founders launch their first product faster' },
    ]);

    expect(tooShort.totalPositive).toBe(0);
    expect(longEnough.totalPositive).toBe(1);
  });

  it('ignores responses that reference an unknown question id', () => {
    const result = calculateScore([
      ...allPositive,
      { questionId: 99, answer: 'all-three' },
    ]);

    expect(result.totalPositive).toBe(10);
  });

  it('ignores an answer value that is not one of the question options', () => {
    const result = calculateScore([{ questionId: 1, answer: 'not-a-real-option' }]);

    expect(result.totalPositive).toBe(0);
  });

  it('always produces at least three action items and a timeframe', () => {
    for (const responses of [allPositive, allNegative, withNegatives(4)]) {
      const result = calculateScore(responses);
      expect(result.actionItems.length).toBeGreaterThanOrEqual(3);
      expect(result.timeframe.length).toBeGreaterThan(0);
      expect(result.summary).toContain(`${result.totalPositive}/10`);
    }
  });

  it('tailors the roadmap to a "not ready for months" answer', () => {
    const result = calculateScore(
      allPositive.map((r) => (r.questionId === 6 ? { ...r, answer: 'months' } : r))
    );

    expect(result.timeframe.toLowerCase()).toContain('date');
    expect(result.actionItems.some((i) => i.includes('MVP'))).toBe(true);
  });

  it('quotes the follow-up answer back when the user is almost ready', () => {
    const result = calculateScore(
      allPositive.map((r) =>
        r.questionId === 6
          ? { ...r, answer: 'almost', followUpAnswer: 'need a payment gateway' }
          : r
      )
    );

    expect(result.actionItems.some((i) => i.includes('need a payment gateway'))).toBe(true);
  });

  it('truncates a very long follow-up answer instead of embedding it whole', () => {
    const longFollowUp = 'x'.repeat(500);
    const result = calculateScore(
      allPositive.map((r) =>
        r.questionId === 6
          ? { ...r, answer: 'almost', followUpAnswer: longFollowUp }
          : r
      )
    );

    const blockerItem = result.actionItems.find((i) => i.startsWith('Week 1: Resolve'));
    expect(blockerItem).toBeDefined();
    expect(blockerItem!.length).toBeLessThan(200);
  });

  it('handles an empty response list without throwing', () => {
    const result = calculateScore([]);

    expect(result.totalPositive).toBe(0);
    expect(result.level).toBe('red');
    expect(result.actionItems.length).toBeGreaterThan(0);
  });
});

describe('calculateDimensionScores', () => {
  it('returns all ten dimensions scored out of one', () => {
    const dimensions = calculateDimensionScores(allPositive);

    expect(dimensions).toHaveLength(10);
    expect(dimensions.every((d) => d.maxScore === 1)).toBe(true);
    expect(dimensions.every((d) => d.score === 1)).toBe(true);
  });

  it('scores nothing when every answer is negative', () => {
    const dimensions = calculateDimensionScores(allNegative);

    expect(dimensions.every((d) => d.score === 0)).toBe(true);
  });

  it('agrees with the total from calculateScore', () => {
    const responses = withNegatives(4);
    const dimensionTotal = calculateDimensionScores(responses).reduce(
      (sum, d) => sum + d.score,
      0
    );

    expect(dimensionTotal).toBe(calculateScore(responses).totalPositive);
  });
});

describe('generateShareText', () => {
  it('includes the score and title', () => {
    const score = calculateScore(allPositive);
    const text = generateShareText(score);

    expect(text).toContain('100%');
    expect(text).toContain(score.title);
  });
});
