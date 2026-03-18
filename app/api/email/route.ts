import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { checkRateLimit, getClientIP } from '@/lib/rate-limiter';
import { emailRequestSchema, validateRequest } from '@/lib/validation';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

// ── Rate-limit: 3 emails per IP per 60 seconds ──
const RATE_LIMIT = { maxRequests: 3, windowSeconds: 60 };

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const clientIP = getClientIP(request);
    const limit = checkRateLimit(`email:${clientIP}`, RATE_LIMIT);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfterSeconds: limit.resetInSeconds,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(limit.resetInSeconds) },
        }
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

    // 3. Validate with Zod
    const validation = validateRequest(emailRequestSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const { email, name, type, result } = validation.data;

    // 4. Check API key
    if (!process.env.RESEND_API_KEY) {
      console.warn('Email service not configured. Skipping email send.');
      return NextResponse.json({
        success: true,
        message: 'Email service not configured',
      });
    }

    // 5. Send the appropriate email
    if (type === 'capture' && result?.scoreResult) {
      await sendWelcomeEmail(email, name || '', result.scoreResult as Record<string, unknown>);
    } else if (type === 'report') {
      await sendDetailedReport(email, name || '');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

// ── Email senders ──

async function sendWelcomeEmail(
  email: string,
  name: string,
  scoreResult: Record<string, unknown>
) {
  const score = scoreResult.score ?? 'N/A';
  const title = String(scoreResult.title ?? 'Your Results');
  const summary = String(scoreResult.summary ?? '');
  const timeframe = String(scoreResult.timeframe ?? '');
  const actionItems = Array.isArray(scoreResult.actionItems)
    ? scoreResult.actionItems.map((item) => escapeHtml(String(item)))
    : [];

  await resend.emails.send({
    from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
    to: email,
    subject: `Your Business Validation Results: ${escapeHtml(title)}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .score-badge { font-size: 48px; font-weight: bold; margin: 20px 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .action-items { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BeamX Business Validator</h1>
              <div class="score-badge">${escapeHtml(String(score))}%</div>
              <h2>${escapeHtml(title)}</h2>
            </div>
            <div class="content">
              <p>Hi ${escapeHtml(name || 'there')},</p>
              <p>${escapeHtml(summary)}</p>

              <div class="action-items">
                <h3>Your Next Steps:</h3>
                <ul>
                  ${actionItems.map((item) => `<li>${item}</li>`).join('')}
                </ul>
              </div>

              <p><strong>Timeframe:</strong> ${escapeHtml(timeframe)}</p>

              <p>We are preparing your detailed personalized report with AI-powered recommendations tailored specifically to your business idea.</p>

              <p>Ready to accelerate your journey? Book a free 30-minute consultation with our team:</p>
              <a href="https://calendly.com/beamx-solutions" class="cta-button">
                Book Free Consultation
              </a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} BeamX Solutions. All rights reserved.</p>
              <p>You received this because you completed the Business Idea Validator.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

async function sendDetailedReport(email: string, name: string) {
  await resend.emails.send({
    from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
    to: email,
    subject: 'Your Detailed Business Validation Report',
    html: `
      <h1>Your Detailed Report is Ready!</h1>
      <p>Hi ${escapeHtml(name || 'there')},</p>
      <p>Your comprehensive business validation report with AI-powered recommendations is ready.</p>
      <p>Visit <a href="${escapeHtml(process.env.NEXT_PUBLIC_APP_URL || '')}">BeamX Business Validator</a> to download your report.</p>
    `,
  });
}

// ── Utility ──

/**
 * Escape user-supplied text before embedding in HTML emails
 * to prevent XSS / HTML injection.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}