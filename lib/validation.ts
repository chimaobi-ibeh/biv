import { z } from 'zod';

// ── Shared field schemas ──

const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(254, 'Email too long');

const safeStringSchema = (maxLength: number) =>
  z
    .string()
    .max(maxLength, `Must be ${maxLength} characters or fewer`)
    .transform((s) => s.trim());

// ── /api/analyze request body ──

export const analyzeRequestSchema = z.object({
  responses: z
    .array(
      z.object({
        questionId: z.number().int().min(1).max(100),
        answer: safeStringSchema(2000),
        followUpAnswer: safeStringSchema(2000).optional(),
      })
    )
    .min(1, 'At least one response is required')
    .max(20, 'Too many responses'),

  userProfile: z.object({
    name: safeStringSchema(100).optional(),
    email: emailSchema.optional().or(z.literal('')),
    industry: safeStringSchema(100).optional(),
    location: safeStringSchema(100).optional(),
    stage: safeStringSchema(100).optional(),
  }),

  scoreLevel: z.enum(['green', 'yellow', 'red']),
  totalPositive: z.number().int().min(0).max(10),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

// ── /api/email request body ──

export const emailRequestSchema = z.object({
  email: emailSchema,
  name: safeStringSchema(100).optional().default(''),
  type: z.enum(['capture', 'report']),
  result: z
    .object({
      userProfile: z.record(z.string(), z.unknown()).optional(),
      responses: z.array(z.record(z.string(), z.unknown())).optional(),
      scoreResult: z.record(z.string(), z.unknown()).optional(),
      dimensionScores: z.array(z.record(z.string(), z.unknown())).optional(),
      aiRecommendation: z.record(z.string(), z.unknown()).nullable().optional(),
      timestamp: z.unknown().optional(),
      id: z.string().optional(),
    })
    .optional(),
});

export type EmailRequest = z.infer<typeof emailRequestSchema>;

// ── /api/pdf request body ──

// Array bounds are set well above what the client can legitimately send:
// there are 10 questions and calculateDimensionScores always emits exactly
// 10 dimensions. They exist to stop a hand-crafted payload from making the
// server-side renderer walk an unbounded number of elements.
export const pdfRequestSchema = z.object({
  userProfile: z.record(z.string(), z.unknown()).optional(),
  responses: z
    .array(z.record(z.string(), z.unknown()))
    .max(100, 'Too many responses')
    .optional(),
  scoreResult: z.record(z.string(), z.unknown()),
  dimensionScores: z
    .array(z.record(z.string(), z.unknown()))
    .max(50, 'Too many dimension scores'),
  aiRecommendation: z.record(z.string(), z.unknown()).nullable().optional(),
  timestamp: z.unknown().optional(),
  id: z.string().max(100, 'Id too long').optional(),
});

export type PdfRequest = z.infer<typeof pdfRequestSchema>;

// ── Validation helper ──

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`
  );
  return { success: false, errors };
}