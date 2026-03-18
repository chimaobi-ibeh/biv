import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AssessmentResult } from '@/types';

export function generatePDFReport(result: AssessmentResult): jsPDF {
  const doc = new jsPDF();
  const { scoreResult, dimensionScores, aiRecommendation, userProfile } = result;

  // ── Brand colours ──────────────────────────────────────────────────
  const blue       = [36, 94, 166] as const;   // #245EA6 – primary
  const darkBlue   = [32, 78, 122] as const;   // #204E7A – secondary
  const green      = [16, 185, 129] as const;
  const yellow     = [245, 158, 11] as const;
  const orange     = [249, 115, 22] as const;
  const red        = [239, 68, 68] as const;
  const lightBg    = [245, 247, 250] as const;
  const textDark   = [15, 23, 32] as const;
  const textGray   = [107, 114, 128] as const;
  const white      = [255, 255, 255] as const;

  const PAGE_W = 210;
  const MARGIN = 20;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  // ── Helpers ────────────────────────────────────────────────────────

  const statusColor = (): readonly number[] => {
    const l = scoreResult.level.toLowerCase();
    if (l.includes('green'))  return green;
    if (l.includes('yellow')) return yellow;
    if (l.includes('red'))    return red;
    return textGray;
  };

  const statusText = (): string => {
    if (scoreResult.level.includes('Light')) return scoreResult.level;
    const l = scoreResult.level.toLowerCase();
    if (l === 'green')  return 'Green Light';
    if (l === 'yellow') return 'Yellow Light';
    if (l === 'red')    return 'Red Light';
    return 'Assessment';
  };

  const sc = statusColor();

  /** Blue top bar + white title */
  const pageHeader = (title: string) => {
    doc.setFillColor(blue[0], blue[1], blue[2]);
    doc.rect(0, 0, PAGE_W, 32, 'F');
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, MARGIN, 21);
    // thin accent line below header
    doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
    doc.rect(0, 32, PAGE_W, 1.5, 'F');
  };

  const pageFooter = () => {
    doc.setDrawColor(220, 225, 230);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, 288, PAGE_W - MARGIN, 288);
    doc.setFontSize(8);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Business Idea Validation Report  |  BeamX Solutions  |  www.beamxsolutions.com', 105, 293, { align: 'center' });
  };

  /** Render text inside a light-bg card; returns new yPos */
  const infoCard = (
    x: number, y: number, w: number,
    label: string, labelColor: readonly number[],
    body: string, fontSize = 9
  ): number => {
    const bodyLines = doc.splitTextToSize(body, w - 10);
    const h = 8 + bodyLines.length * (fontSize * 0.45) + 10;
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.roundedRect(x, y, w, h, 2, 2, 'F');
    doc.setFontSize(11);
    doc.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(label, x + 5, y + 8);
    doc.setFontSize(fontSize);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(bodyLines, x + 5, y + 15);
    return y + h + 6;
  };

  /** Safe new page if content would overflow */
  const safeY = (y: number, needed: number, headerFn: () => void): number => {
    if (y + needed > 278) {
      doc.addPage();
      headerFn();
      pageFooter();
      return 44;
    }
    return y;
  };

  // ══════════════════════════════════════════════════════════════════
  // PAGE 1 – COVER
  // ══════════════════════════════════════════════════════════════════

  // Top blue band
  doc.setFillColor(blue[0], blue[1], blue[2]);
  doc.rect(0, 0, PAGE_W, 110, 'F');

  // Logo text
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BeamX', MARGIN, 22);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 220, 245);
  doc.text('S O L U T I O N S', MARGIN, 29);

  // Report title
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('Business Idea', 105, 52, { align: 'center' });
  doc.text('Validation Report', 105, 67, { align: 'center' });

  // Score circle
  doc.setFillColor(sc[0], sc[1], sc[2]);
  doc.circle(105, 108, 20, 'F');
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(`${scoreResult.score}%`, 105, 114, { align: 'center' });

  // Status badge
  doc.setFillColor(sc[0], sc[1], sc[2]);
  doc.roundedRect(75, 133, 60, 11, 2, 2, 'F');
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(statusText(), 105, 140, { align: 'center' });

  // User info card
  doc.setFillColor(white[0], white[1], white[2]);
  doc.roundedRect(35, 158, 140, 50, 3, 3, 'F');
  doc.setDrawColor(blue[0], blue[1], blue[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(35, 158, 140, 50, 3, 3, 'S');

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(userProfile.name || 'Entrepreneur', 105, 174, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.setFont('helvetica', 'normal');
  const details = [userProfile.industry, userProfile.location].filter(Boolean).join('  •  ');
  if (details) doc.text(details, 105, 184, { align: 'center' });

  const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(9);
  doc.text(reportDate, 105, 193, { align: 'center' });

  // Bottom tagline
  doc.setFontSize(9);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text('Prepared By  BeamX Solutions', 105, 268, { align: 'center' });
  doc.text('Data-Driven Startup Validation', 105, 275, { align: 'center' });

  pageFooter();

  // ══════════════════════════════════════════════════════════════════
  // PAGE 2 – EXECUTIVE SUMMARY
  // ══════════════════════════════════════════════════════════════════

  doc.addPage();
  pageHeader('EXECUTIVE SUMMARY');
  pageFooter();

  let y = 44;

  // Score status banner
  doc.setFillColor(sc[0], sc[1], sc[2]);
  doc.roundedRect(MARGIN, y, CONTENT_W, 10, 2, 2, 'F');
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${statusText()}  -  ${scoreResult.totalPositive} / 10 positive indicators`, MARGIN + 5, y + 7);
  y += 16;

  // Summary paragraph
  doc.setFontSize(10);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'normal');
  const summaryLines = doc.splitTextToSize(scoreResult.summary, CONTENT_W);
  doc.text(summaryLines, MARGIN, y);
  y += summaryLines.length * 5 + 10;

  // Metrics card
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(MARGIN, y, CONTENT_W, 35, 3, 3, 'F');
  doc.setFontSize(11);
  doc.setTextColor(blue[0], blue[1], blue[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('READINESS METRICS', MARGIN + 5, y + 10);
  doc.setFontSize(10);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(`Overall Score:  ${scoreResult.score}%  (${scoreResult.totalPositive}/10 positive)`, MARGIN + 5, y + 19);
  doc.text(`Status:  ${statusText().toUpperCase()}`, MARGIN + 5, y + 26);
  doc.text(`Recommended Timeframe:  ${scoreResult.timeframe}`, MARGIN + 5, y + 33);
  y += 44;

  // Immediate next steps
  doc.setFontSize(13);
  doc.setTextColor(blue[0], blue[1], blue[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Immediate Next Steps', MARGIN, y);
  y += 8;

  scoreResult.actionItems.forEach((item, idx) => {
    y = safeY(y, 10, () => pageHeader('EXECUTIVE SUMMARY (continued)'));
    doc.setDrawColor(blue[0], blue[1], blue[2]);
    doc.setLineWidth(0.5);
    doc.rect(MARGIN, y - 3, 4, 4);
    doc.setFontSize(10);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(`${idx + 1}.  ${item}`, CONTENT_W - 10);
    doc.text(lines, MARGIN + 7, y);
    y += lines.length * 5 + 3;
  });

  // ══════════════════════════════════════════════════════════════════
  // PAGE 3 – DIMENSION ANALYSIS
  // ══════════════════════════════════════════════════════════════════

  doc.addPage();
  pageHeader('DIMENSION ANALYSIS');
  pageFooter();

  const tableData = dimensionScores.map((d) => {
    const pct = d.maxScore > 0 ? Math.round((d.score / d.maxScore) * 100) : 0;
    const status = pct === 100 ? 'Strong' : pct >= 50 ? 'Moderate' : 'Needs Work';
    return [d.name, `${d.score} / ${d.maxScore}`, status, `${pct}%`];
  });

  autoTable(doc, {
    startY: 44,
    head: [['Dimension', 'Score', 'Status', 'Progress']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [blue[0], blue[1], blue[2]],
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 65, fontStyle: 'bold' },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 45, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' },
    },
    alternateRowStyles: { fillColor: [lightBg[0], lightBg[1], lightBg[2]] },
    styles: { fontSize: 10, cellPadding: 6, font: 'helvetica' },
    didParseCell(data) {
      if (data.column.index === 2 && data.row.index >= 0) {
        const t = data.cell.text[0];
        if (t === 'Strong')      { data.cell.styles.textColor = [green[0], green[1], green[2]]; data.cell.styles.fontStyle = 'bold'; }
        else if (t === 'Moderate') { data.cell.styles.textColor = [yellow[0], yellow[1], yellow[2]]; data.cell.styles.fontStyle = 'bold'; }
        else                     { data.cell.styles.textColor = [red[0], red[1], red[2]]; }
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 14;

  // Strengths & gaps summary
  doc.setFontSize(13);
  doc.setTextColor(blue[0], blue[1], blue[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Your Strengths & Opportunities', MARGIN, y);
  y += 10;

  const strong = dimensionScores.filter((d) => d.score === d.maxScore);
  const weak   = dimensionScores.filter((d) => d.score < d.maxScore);

  if (strong.length > 0) {
    doc.setFillColor(green[0], green[1], green[2]);
    doc.circle(MARGIN + 2, y - 1.5, 2, 'F');
    doc.setFontSize(11);
    doc.setTextColor(green[0], green[1], green[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Strengths:', MARGIN + 7, y);
    doc.setFontSize(10);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(strong.map((d) => d.name).join(', '), MARGIN + 7, y + 6);
    y += 16;
  }

  if (weak.length > 0) {
    doc.setFillColor(orange[0], orange[1], orange[2]);
    doc.circle(MARGIN + 2, y - 1.5, 2, 'F');
    doc.setFontSize(11);
    doc.setTextColor(orange[0], orange[1], orange[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Areas for Improvement:', MARGIN + 7, y);
    doc.setFontSize(10);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'normal');
    const weakLines = doc.splitTextToSize(weak.map((d) => d.name).join(', '), CONTENT_W - 10);
    doc.text(weakLines, MARGIN + 7, y + 6);
  }

  // ══════════════════════════════════════════════════════════════════
  // AI RECOMMENDATION PAGES (only if available)
  // ══════════════════════════════════════════════════════════════════

  if (aiRecommendation) {
    // ── PAGE: AI INSIGHTS (Strengths + Gaps) ──
    doc.addPage();
    pageHeader('AI-POWERED INSIGHTS');
    pageFooter();

    y = 44;

    // Strengths
    {
      const lines = aiRecommendation.strengths.flatMap((s) => doc.splitTextToSize(`• ${s}`, CONTENT_W - 10));
      const h = 14 + lines.length * 4.5 + 6;
      doc.setFillColor(236, 253, 245);
      doc.roundedRect(MARGIN, y, CONTENT_W, h, 3, 3, 'F');
      doc.setFontSize(12);
      doc.setTextColor(green[0], green[1], green[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('Your Key Strengths', MARGIN + 5, y + 9);
      doc.setFontSize(9);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFont('helvetica', 'normal');
      let iy = y + 16;
      aiRecommendation.strengths.forEach((s) => {
        const sl = doc.splitTextToSize(`• ${s}`, CONTENT_W - 10);
        doc.text(sl, MARGIN + 5, iy);
        iy += sl.length * 4.5;
      });
      y += h + 10;
    }

    // Gaps
    {
      const lines = aiRecommendation.gaps.flatMap((g) => doc.splitTextToSize(`• ${g}`, CONTENT_W - 10));
      const h = 14 + lines.length * 4.5 + 6;
      y = safeY(y, h, () => { pageHeader('AI-POWERED INSIGHTS (continued)'); pageFooter(); });
      doc.setFillColor(255, 247, 237);
      doc.roundedRect(MARGIN, y, CONTENT_W, h, 3, 3, 'F');
      doc.setFontSize(12);
      doc.setTextColor(orange[0], orange[1], orange[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('Critical Gaps to Address', MARGIN + 5, y + 9);
      doc.setFontSize(9);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFont('helvetica', 'normal');
      let iy = y + 16;
      aiRecommendation.gaps.forEach((g) => {
        const gl = doc.splitTextToSize(`• ${g}`, CONTENT_W - 10);
        doc.text(gl, MARGIN + 5, iy);
        iy += gl.length * 4.5;
      });
    }

    // ── PAGE: ACTION PLAN ──
    doc.addPage();
    pageHeader('YOUR ACTION PLAN');
    pageFooter();

    y = 44;
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    const planLines = doc.splitTextToSize(aiRecommendation.personalizedPlan, CONTENT_W - 10);
    const planH = planLines.length * 5 + 14;
    doc.roundedRect(MARGIN, y, CONTENT_W, planH, 3, 3, 'F');

    // left accent bar
    doc.setFillColor(blue[0], blue[1], blue[2]);
    doc.rect(MARGIN, y, 3, planH, 'F');

    doc.setFontSize(10);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(planLines, MARGIN + 8, y + 9);

    // ── PAGE(S): WEEKLY ROADMAP ──
    doc.addPage();
    pageHeader('WEEKLY ROADMAP');
    pageFooter();
    y = 44;

    const roadmapHeader = () => { pageHeader('WEEKLY ROADMAP (continued)'); pageFooter(); };

    aiRecommendation.weeklyRoadmap.forEach((week) => {
      // Estimate space needed for this week
      const taskLines = week.tasks.flatMap((t) => doc.splitTextToSize(t, CONTENT_W - 15));
      const needed = 14 + taskLines.length * 4.5 + 10;
      y = safeY(y, needed, roadmapHeader);

      // Week header pill
      doc.setFillColor(blue[0], blue[1], blue[2]);
      doc.roundedRect(MARGIN, y, CONTENT_W, 10, 2, 2, 'F');
      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Week ${week.week}`, MARGIN + 5, y + 7);
      y += 14;

      doc.setFontSize(9);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFont('helvetica', 'normal');

      week.tasks.forEach((task) => {
        const tl = doc.splitTextToSize(task, CONTENT_W - 12);
        y = safeY(y, tl.length * 4.5 + 4, roadmapHeader);
        doc.setDrawColor(blue[0], blue[1], blue[2]);
        doc.setLineWidth(0.4);
        doc.rect(MARGIN, y - 3, 3.5, 3.5);
        doc.text(tl, MARGIN + 6, y);
        y += tl.length * 4.5 + 3;
      });

      y += 6;
    });

    // ── PAGE: RECOMMENDED RESOURCES ──
    doc.addPage();
    pageHeader('RECOMMENDED RESOURCES');
    pageFooter();
    y = 44;

    const resourceHeader = () => { pageHeader('RECOMMENDED RESOURCES (continued)'); pageFooter(); };

    aiRecommendation.resources.forEach((resource) => {
      const descLines = doc.splitTextToSize(resource.description, CONTENT_W - 10);
      const cardH = 10 + descLines.length * 4.5 + 12;
      y = safeY(y, cardH, resourceHeader);

      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.roundedRect(MARGIN, y, CONTENT_W, cardH, 3, 3, 'F');

      doc.setFontSize(11);
      doc.setTextColor(blue[0], blue[1], blue[2]);
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(resource.title, CONTENT_W - 10);
      doc.text(titleLines, MARGIN + 5, y + 8);

      doc.setFontSize(9);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(descLines, MARGIN + 5, y + 8 + titleLines.length * 5 + 2);

      y += cardH + 6;
    });

    // ── PAGE: RISK ASSESSMENT ──
    doc.addPage();
    pageHeader('RISK ASSESSMENT');
    pageFooter();

    y = 44;
    const riskLines = doc.splitTextToSize(aiRecommendation.riskAssessment, CONTENT_W - 10);
    const riskH = riskLines.length * 5 + 14;

    doc.setFillColor(254, 242, 242);
    doc.roundedRect(MARGIN, y, CONTENT_W, riskH, 3, 3, 'F');

    // left accent bar
    doc.setFillColor(red[0], red[1], red[2]);
    doc.rect(MARGIN, y, 3, riskH, 'F');

    doc.setFontSize(10);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(riskLines, MARGIN + 8, y + 9);
  }

  // ══════════════════════════════════════════════════════════════════
  // FINAL PAGE – CALL TO ACTION
  // ══════════════════════════════════════════════════════════════════

  doc.addPage();

  // Blue full-page background
  doc.setFillColor(blue[0], blue[1], blue[2]);
  doc.rect(0, 0, PAGE_W, 297, 'F');

  // White card
  doc.setFillColor(white[0], white[1], white[2]);
  doc.roundedRect(30, 60, 150, 130, 5, 5, 'F');

  doc.setTextColor(blue[0], blue[1], blue[2]);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Ready to Take Action?', 105, 84, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Based on your results, BeamX Solutions can help you', 105, 95, { align: 'center' });
  doc.text('implement the recommendations above.', 105, 102, { align: 'center' });

  // Divider
  doc.setDrawColor(220, 225, 230);
  doc.setLineWidth(0.4);
  doc.line(50, 108, 160, 108);

  doc.setFontSize(10);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Free 30-Min Consultation', 105, 120, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(blue[0], blue[1], blue[2]);
  doc.text('www.beamxsolutions.com', 105, 128, { align: 'center' });

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('1-on-1 Validation Session', 105, 142, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text('calendly.com/beamx-solutions', 105, 149, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Email Us', 105, 162, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(blue[0], blue[1], blue[2]);
  doc.text('info@beamxsolutions.com', 105, 169, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(200, 220, 245);
  doc.setFont('helvetica', 'normal');
  doc.text(`© ${new Date().getFullYear()} BeamX Solutions. All rights reserved.`, 105, 280, { align: 'center' });

  return doc;
}
