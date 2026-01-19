import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { AssessmentResult } from '@/types';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

// Supabase configuration (server-side service role key recommended)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Logo URL - hosted on the public domain
const LOGO_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`
  : 'https://stellar.beamxsolutions.com/logo.png';

export async function POST(request: NextRequest) {
  try {
    const { email, name, result, type } = await request.json();

    if (!process.env.RESEND_API_KEY) {
      console.warn('Email service not configured - skipping email');
      return NextResponse.json({ success: true, message: 'Email service not configured' });
    }

    // Save submission to Supabase (if configured)
    if (supabase) {
      try {
        const insertPayload = {
          id: result.id,
          email,
          name,
          type,
          result,
        };

        const { error: dbError } = await supabase.from('startup_validator').insert(insertPayload);
        if (dbError) {
          console.warn('Supabase insert error:', dbError);
        }
      } catch (err) {
        console.warn('Supabase insert failed:', err);
      }
    } else {
      console.warn('Supabase not configured - skipping save');
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

// Professional email template generator
function generateEmailTemplate({
  title,
  preheader,
  bodyContent,
  footerText,
}: {
  title: string;
  preheader: string;
  bodyContent: string;
  footerText?: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset */
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }

    /* Typography */
    body, td { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }

    /* Responsive */
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content-block { padding: 20px !important; }
      .header-logo { width: 150px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fa;">
  <!-- Preheader text (hidden) -->
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${preheader}
  </div>

  <!-- Main wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f7fa;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Email container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header with Logo -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <img src="${LOGO_URL}" alt="BeamX Solutions" width="180" class="header-logo" style="display: block; margin: 0 auto; max-width: 180px;">
            </td>
          </tr>

          <!-- Title Bar -->
          <tr>
            <td style="background-color: #0066CC; padding: 15px 40px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; text-align: center; letter-spacing: 0.5px;">
                ${title}
              </h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td class="content-block" style="padding: 40px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;">
            </td>
          </tr>

          <!-- Contact Section -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 15px; color: #374151; font-size: 16px; font-weight: 600;">
                      Need Expert Guidance?
                    </p>
                    <a href="https://calendly.com/beamxsolutions" target="_blank" style="display: inline-block; background-color: #FF8C00; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 30px; border-radius: 6px;">
                      Book a Free Consultation
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 30px 40px; text-align: center;">
              <p style="margin: 0 0 10px; color: #9ca3af; font-size: 14px;">
                <a href="https://www.beamxsolutions.com" style="color: #9ca3af; text-decoration: none;">www.beamxsolutions.com</a>
                &nbsp;|&nbsp;
                <a href="mailto:info@beamxsolutions.com" style="color: #9ca3af; text-decoration: none;">info@beamxsolutions.com</a>
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} BeamX Solutions. All rights reserved.
              </p>
              ${footerText ? `<p style="margin: 10px 0 0; color: #6b7280; font-size: 11px;">${footerText}</p>` : ''}
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Generate score badge HTML
function getScoreBadge(score: number, level: string) {
  const colors: Record<string, { bg: string; border: string }> = {
    'green': { bg: '#10B981', border: '#059669' },
    'yellow': { bg: '#F59E0B', border: '#D97706' },
    'orange': { bg: '#F97316', border: '#EA580C' },
    'red': { bg: '#EF4444', border: '#DC2626' },
  };

  const levelKey = level.toLowerCase().split(' ')[0];
  const color = colors[levelKey] || colors['yellow'];

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
      <tr>
        <td align="center">
          <div style="display: inline-block; background-color: ${color.bg}; border: 4px solid ${color.border}; border-radius: 50%; width: 120px; height: 120px; line-height: 112px; text-align: center;">
            <span style="font-size: 42px; font-weight: 700; color: #ffffff;">${score}%</span>
          </div>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-top: 15px;">
          <span style="display: inline-block; background-color: ${color.bg}; color: #ffffff; font-size: 16px; font-weight: 700; padding: 8px 24px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">
            ${level}
          </span>
        </td>
      </tr>
    </table>
  `;
}

async function sendWelcomeEmail(email: string, name: string, result: AssessmentResult) {
  const { scoreResult } = result;
  const greeting = name ? `Hi ${name},` : 'Hi there,';

  const bodyContent = `
    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
      ${greeting}
    </p>

    <p style="margin: 0 0 25px; color: #374151; font-size: 16px; line-height: 1.6;">
      Thank you for completing the <strong>Business Idea Validator</strong>! Here's your assessment summary:
    </p>

    ${getScoreBadge(scoreResult.score, scoreResult.level)}

    <!-- Summary Box -->
    <div style="background-color: #f0f9ff; border-left: 4px solid #0066CC; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
        ${scoreResult.summary}
      </p>
    </div>

    <!-- Action Items -->
    <div style="background-color: #fefce8; border: 1px solid #fef08a; padding: 20px; margin-bottom: 25px; border-radius: 8px;">
      <h3 style="margin: 0 0 15px; color: #854d0e; font-size: 16px; font-weight: 700;">
        🎯 Your Next Steps:
      </h3>
      <ul style="margin: 0; padding: 0 0 0 20px; color: #713f12;">
        ${scoreResult.actionItems.map(item => `<li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">${item}</li>`).join('')}
      </ul>
    </div>

    <!-- Timeframe -->
    <div style="background-color: #f3f4f6; padding: 15px 20px; border-radius: 8px; margin-bottom: 25px;">
      <p style="margin: 0; color: #374151; font-size: 14px;">
        <strong>⏱️ Estimated Timeframe:</strong> ${scoreResult.timeframe}
      </p>
    </div>

    <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Your detailed PDF report with AI-powered personalized recommendations is attached to this email.
    </p>
  `;

  // Generate PDF for attachment
  let pdfAttachment;
  try {
    const { generatePDFBuffer } = await import('@/lib/pdf-generator-server');
    const pdfBuffer = await generatePDFBuffer(result);
    pdfAttachment = {
      filename: `BeamX-Business-Validation-Report-${new Date().toISOString().split('T')[0]}.pdf`,
      content: pdfBuffer,
    };
  } catch (err) {
    console.warn('PDF generation failed, sending email without attachment:', err);
  }

  const emailHtml = generateEmailTemplate({
    title: 'Your Business Validation Results',
    preheader: `Your score: ${scoreResult.score}% - ${scoreResult.level}. See your personalized recommendations inside.`,
    bodyContent,
    footerText: "You're receiving this because you completed the Business Idea Validator assessment.",
  });

  await resend.emails.send({
    from: process.env.FROM_EMAIL || 'BeamX Solutions <onboarding@resend.dev>',
    to: email,
    subject: `Your Business Validation Score: ${scoreResult.score}% - ${scoreResult.level}`,
    html: emailHtml,
    ...(pdfAttachment && { attachments: [pdfAttachment] }),
  });
}

async function sendDetailedReport(email: string, name: string, result: AssessmentResult) {
  const greeting = name ? `Hi ${name},` : 'Hi there,';

  const bodyContent = `
    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
      ${greeting}
    </p>

    <p style="margin: 0 0 25px; color: #374151; font-size: 16px; line-height: 1.6;">
      Your comprehensive <strong>Business Validation Report</strong> with AI-powered recommendations is ready!
    </p>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <h3 style="margin: 0 0 10px; color: #166534; font-size: 16px; font-weight: 700;">
        📄 What's Included:
      </h3>
      <ul style="margin: 0; padding: 0 0 0 20px; color: #15803d;">
        <li style="margin-bottom: 8px; font-size: 14px;">Complete score breakdown by category</li>
        <li style="margin-bottom: 8px; font-size: 14px;">AI-generated personalized recommendations</li>
        <li style="margin-bottom: 8px; font-size: 14px;">Week-by-week action roadmap</li>
        <li style="margin-bottom: 8px; font-size: 14px;">Risk assessment and mitigation strategies</li>
        <li style="font-size: 14px;">Curated resources for your journey</li>
      </ul>
    </div>

    <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Your PDF report is attached to this email. You can also view your results online anytime.
    </p>
  `;

  // Generate PDF for attachment
  let pdfAttachment;
  try {
    const { generatePDFBuffer } = await import('@/lib/pdf-generator-server');
    const pdfBuffer = await generatePDFBuffer(result);
    pdfAttachment = {
      filename: `BeamX-Business-Validation-Report-${new Date().toISOString().split('T')[0]}.pdf`,
      content: pdfBuffer,
    };
  } catch (err) {
    console.warn('PDF generation failed, sending email without attachment:', err);
  }

  const emailHtml = generateEmailTemplate({
    title: 'Your Detailed Report is Ready',
    preheader: 'Your comprehensive business validation report with AI recommendations is attached.',
    bodyContent,
    footerText: "You're receiving this because you requested a detailed report from the Business Idea Validator.",
  });

  await resend.emails.send({
    from: process.env.FROM_EMAIL || 'BeamX Solutions <onboarding@resend.dev>',
    to: email,
    subject: 'Your Detailed Business Validation Report',
    html: emailHtml,
    ...(pdfAttachment && { attachments: [pdfAttachment] }),
  });
}
