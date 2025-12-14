import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { AssessmentResult } from '@/types';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export async function POST(request: NextRequest) {
  try {
    const { email, name, result, type } = await request.json();

    if (!process.env.RESEND_API_KEY) {
      console.warn('Email service not configured - skipping email');
      return NextResponse.json({ success: true, message: 'Email service not configured' });
    }

    if (type === 'capture') {
      await sendWelcomeEmail(email, name, result);
    } else if (type === 'report') {
      await sendDetailedReport(email, name, result);
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

async function sendWelcomeEmail(email: string, name: string, result: AssessmentResult) {
  const { scoreResult } = result;

  await resend.emails.send({
    from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
    to: email,
    subject: `Your Business Validation Results: ${scoreResult.title}`,
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
              <div class="score-badge">${scoreResult.score}%</div>
              <h2>${scoreResult.title}</h2>
            </div>
            <div class="content">
              <p>Hi ${name || 'there'},</p>
              <p>${scoreResult.summary}</p>

              <div class="action-items">
                <h3>Your Next Steps:</h3>
                <ul>
                  ${scoreResult.actionItems.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>

              <p><strong>Timeframe:</strong> ${scoreResult.timeframe}</p>

              <p>We're preparing your detailed personalized report with AI-powered recommendations tailored specifically to your business idea.</p>

              <a href="${process.env.NEXT_PUBLIC_APP_URL}/results/${result.id}" class="cta-button">
                View Your Full Results
              </a>

              <p>Ready to accelerate your journey? Book a free 30-minute consultation with our team:</p>
              <a href="https://calendly.com/beamx-solutions" class="cta-button">
                Book Free Consultation
              </a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} BeamX Solutions. All rights reserved.</p>
              <p>You're receiving this because you completed the Business Idea Validator.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

async function sendDetailedReport(email: string, name: string, result: AssessmentResult) {
  await resend.emails.send({
    from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
    to: email,
    subject: 'Your Detailed Business Validation Report',
    html: `
      <h1>Your Detailed Report is Ready!</h1>
      <p>Hi ${name},</p>
      <p>Your comprehensive business validation report with AI-powered recommendations is ready for download.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/results/${result.id}">Download Your Report</a>
    `,
  });
}
