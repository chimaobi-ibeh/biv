import { describe, it, expect } from 'vitest';
import {
  analyzeRequestSchema,
  emailRequestSchema,
  pdfRequestSchema,
  validateRequest,
} from '@/lib/validation';

const validAnalyzeBody = {
  responses: [{ questionId: 1, answer: 'all-three' }],
  userProfile: { name: 'Ada', email: 'ada@example.com' },
  scoreLevel: 'green',
  totalPositive: 9,
};

describe('validateRequest', () => {
  it('returns the parsed data on success', () => {
    const result = validateRequest(analyzeRequestSchema, validAnalyzeBody);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.totalPositive).toBe(9);
  });

  it('returns path-prefixed error strings on failure', () => {
    const result = validateRequest(analyzeRequestSchema, {
      ...validAnalyzeBody,
      totalPositive: 99,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.startsWith('totalPositive:'))).toBe(true);
    }
  });

  it('rejects non-object bodies instead of throwing', () => {
    for (const body of [null, undefined, 'string', 42, []]) {
      expect(validateRequest(analyzeRequestSchema, body).success).toBe(false);
    }
  });
});

describe('analyzeRequestSchema', () => {
  it('accepts a well-formed body', () => {
    expect(analyzeRequestSchema.safeParse(validAnalyzeBody).success).toBe(true);
  });

  it('requires at least one response and allows at most twenty', () => {
    const make = (n: number) =>
      Array.from({ length: n }, (_, i) => ({ questionId: i + 1, answer: 'x' }));

    expect(
      analyzeRequestSchema.safeParse({ ...validAnalyzeBody, responses: [] }).success
    ).toBe(false);
    expect(
      analyzeRequestSchema.safeParse({ ...validAnalyzeBody, responses: make(20) }).success
    ).toBe(true);
    expect(
      analyzeRequestSchema.safeParse({ ...validAnalyzeBody, responses: make(21) }).success
    ).toBe(false);
  });

  it('caps answer length at 2000 characters', () => {
    const withAnswer = (answer: string) => ({
      ...validAnalyzeBody,
      responses: [{ questionId: 1, answer }],
    });

    expect(analyzeRequestSchema.safeParse(withAnswer('a'.repeat(2000))).success).toBe(true);
    expect(analyzeRequestSchema.safeParse(withAnswer('a'.repeat(2001))).success).toBe(false);
  });

  it('constrains questionId to a plausible integer range', () => {
    const withId = (questionId: unknown) => ({
      ...validAnalyzeBody,
      responses: [{ questionId, answer: 'x' }],
    });

    expect(analyzeRequestSchema.safeParse(withId(0)).success).toBe(false);
    expect(analyzeRequestSchema.safeParse(withId(101)).success).toBe(false);
    expect(analyzeRequestSchema.safeParse(withId(1.5)).success).toBe(false);
    expect(analyzeRequestSchema.safeParse(withId('1')).success).toBe(false);
  });

  it('only accepts the three known score levels', () => {
    for (const scoreLevel of ['green', 'yellow', 'red']) {
      expect(
        analyzeRequestSchema.safeParse({ ...validAnalyzeBody, scoreLevel }).success
      ).toBe(true);
    }
    expect(
      analyzeRequestSchema.safeParse({ ...validAnalyzeBody, scoreLevel: 'blue' }).success
    ).toBe(false);
  });

  it('bounds totalPositive to 0-10', () => {
    const withTotal = (totalPositive: number) => ({ ...validAnalyzeBody, totalPositive });

    expect(analyzeRequestSchema.safeParse(withTotal(0)).success).toBe(true);
    expect(analyzeRequestSchema.safeParse(withTotal(10)).success).toBe(true);
    expect(analyzeRequestSchema.safeParse(withTotal(-1)).success).toBe(false);
    expect(analyzeRequestSchema.safeParse(withTotal(11)).success).toBe(false);
  });

  it('trims whitespace off string fields', () => {
    const parsed = analyzeRequestSchema.parse({
      ...validAnalyzeBody,
      responses: [{ questionId: 1, answer: '  padded  ' }],
      userProfile: { name: '  Ada  ' },
    });

    expect(parsed.responses[0].answer).toBe('padded');
    expect(parsed.userProfile.name).toBe('Ada');
  });

  it('rejects a malformed profile email but allows an empty string', () => {
    const withEmail = (email: string) => ({
      ...validAnalyzeBody,
      userProfile: { email },
    });

    expect(analyzeRequestSchema.safeParse(withEmail('')).success).toBe(true);
    expect(analyzeRequestSchema.safeParse(withEmail('not-an-email')).success).toBe(false);
  });

  it('strips unknown top-level keys rather than trusting them', () => {
    const parsed = analyzeRequestSchema.parse({
      ...validAnalyzeBody,
      isAdmin: true,
    });

    expect(parsed).not.toHaveProperty('isAdmin');
  });
});

describe('emailRequestSchema', () => {
  const validEmailBody = { email: 'ada@example.com', type: 'capture' };

  it('accepts a minimal capture request and defaults the name', () => {
    const parsed = emailRequestSchema.parse(validEmailBody);
    expect(parsed.name).toBe('');
  });

  it('requires a valid email address', () => {
    for (const email of ['', 'nope', 'a@b', 'a@'.repeat(200)]) {
      expect(emailRequestSchema.safeParse({ ...validEmailBody, email }).success).toBe(false);
    }
  });

  it('rejects an email longer than 254 characters', () => {
    const long = `${'a'.repeat(250)}@example.com`;
    expect(emailRequestSchema.safeParse({ ...validEmailBody, email: long }).success).toBe(false);
  });

  it('only accepts the two known email types', () => {
    expect(emailRequestSchema.safeParse({ ...validEmailBody, type: 'report' }).success).toBe(true);
    expect(emailRequestSchema.safeParse({ ...validEmailBody, type: 'admin' }).success).toBe(false);
  });

  it('caps the name at 100 characters', () => {
    expect(
      emailRequestSchema.safeParse({ ...validEmailBody, name: 'a'.repeat(101) }).success
    ).toBe(false);
  });
});

describe('pdfRequestSchema', () => {
  const validPdfBody = {
    scoreResult: { score: 80, title: 'GREEN LIGHT' },
    dimensionScores: [{ name: 'Foundation', score: 1, maxScore: 1 }],
  };

  it('accepts a body with the required result fields', () => {
    expect(pdfRequestSchema.safeParse(validPdfBody).success).toBe(true);
  });

  it('requires scoreResult and dimensionScores', () => {
    expect(pdfRequestSchema.safeParse({ dimensionScores: [] }).success).toBe(false);
    expect(pdfRequestSchema.safeParse({ scoreResult: {} }).success).toBe(false);
  });

  it('accepts a realistic payload of 10 responses and 10 dimensions', () => {
    const rows = (n: number) => Array.from({ length: n }, () => ({ score: 1 }));

    expect(
      pdfRequestSchema.safeParse({
        ...validPdfBody,
        responses: rows(10),
        dimensionScores: rows(10),
      }).success
    ).toBe(true);
  });

  it('rejects array payloads far larger than the client could produce', () => {
    const rows = (n: number) => Array.from({ length: n }, () => ({ score: 1 }));

    expect(
      pdfRequestSchema.safeParse({ ...validPdfBody, dimensionScores: rows(51) }).success
    ).toBe(false);
    expect(
      pdfRequestSchema.safeParse({ ...validPdfBody, responses: rows(101) }).success
    ).toBe(false);
  });

  it('allows aiRecommendation to be null or absent', () => {
    expect(
      pdfRequestSchema.safeParse({ ...validPdfBody, aiRecommendation: null }).success
    ).toBe(true);
    expect(pdfRequestSchema.safeParse(validPdfBody).success).toBe(true);
  });
});
