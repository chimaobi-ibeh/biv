/**
 * Sanitise user-supplied text before it is interpolated into an
 * LLM prompt.  The goal is NOT to block creative input but to strip
 * patterns that attempt to override or redirect the system prompt.
 */

/**
 * Patterns commonly used in prompt-injection attacks.
 * Each entry is [regex, replacement].
 */
const INJECTION_PATTERNS: [RegExp, string][] = [
  // Attempts to start a new system / assistant message
  [/\b(system|assistant)\s*:/gi, '[filtered]:'],
  // Common override phrases
  [/ignore\s+(all\s+)?(previous|above|prior)\s+(instructions|prompts|rules)/gi, '[filtered]'],
  [/disregard\s+(all\s+)?(previous|above|prior)\s+(instructions|prompts|rules)/gi, '[filtered]'],
  [/forget\s+(all\s+)?(previous|above|prior)\s+(instructions|prompts|rules)/gi, '[filtered]'],
  [/you\s+are\s+now\s+(a|an|the)/gi, '[filtered]'],
  [/pretend\s+you\s+are/gi, '[filtered]'],
  [/act\s+as\s+(a|an|if)/gi, '[filtered]'],
  [/new\s+instructions?\s*:/gi, '[filtered]:'],
  [/override\s+(mode|instructions?)/gi, '[filtered]'],
  // Markdown / XML injection to fake message boundaries
  [/<\/?system>/gi, '[filtered]'],
  [/<\/?assistant>/gi, '[filtered]'],
  [/<\/?user>/gi, '[filtered]'],
  [/<\/?human>/gi, '[filtered]'],
];

/**
 * Hard cap on how long any single field can be once it reaches the
 * prompt.  This limits token cost from adversarial inputs too.
 */
const MAX_FIELD_LENGTH = 1000;

/**
 * Sanitise a single user-supplied string for safe prompt inclusion.
 */
export function sanitizeForPrompt(input: string): string {
  let cleaned = input.slice(0, MAX_FIELD_LENGTH);

  for (const [pattern, replacement] of INJECTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  return cleaned.trim();
}

/**
 * Sanitise an entire user profile object.
 */
export function sanitizeUserProfile(profile: Record<string, string | undefined>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(profile)) {
    if (value) {
      sanitized[key] = sanitizeForPrompt(value);
    }
  }
  return sanitized;
}

/**
 * Sanitise an array of assessment responses.
 */
export function sanitizeResponses(
  responses: { questionId: number; answer: string; followUpAnswer?: string }[]
): { questionId: number; answer: string; followUpAnswer?: string }[] {
  return responses.map((r) => ({
    questionId: r.questionId,
    answer: sanitizeForPrompt(r.answer),
    followUpAnswer: r.followUpAnswer
      ? sanitizeForPrompt(r.followUpAnswer)
      : undefined,
  }));
}