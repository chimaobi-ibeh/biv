import { NextRequest, NextResponse } from 'next/server';
import { AssessmentResult } from '@/types';
import { checkRateLimit, getClientIP } from '@/lib/rate-limiter';
import { pdfRequestSchema, validateRequest } from '@/lib/validation';
import { generatePDFBuffer } from '@/lib/pdf-generator-server';

// React PDF requires the Node.js runtime (uses Node streams / fontkit).
export const runtime = 'nodejs';

// ── Rate-limit: 10 downloads per IP per 60 seconds ──
const RATE_LIMIT = { maxRequests: 10, windowSeconds: 60 };

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const clientIP = getClientIP(request);
    const limit = checkRateLimit(`pdf:${clientIP}`, RATE_LIMIT);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfterSeconds: limit.resetInSeconds,
        },
        { status: 429, headers: { 'Retry-After': String(limit.resetInSeconds) } }
      );
    }

    // 2. Parse body safely
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // 3. Validate shape
    const validation = validateRequest(pdfRequestSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // 4. Render the PDF on the server
    const result = validation.data as unknown as AssessmentResult;
    const buffer = await generatePDFBuffer(result);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          'attachment; filename="business-idea-validation-report.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF report' },
      { status: 500 }
    );
  }
}
