import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AssessmentResult } from '@/types';

export function generatePDFReport(result: AssessmentResult): jsPDF {
  const doc = new jsPDF();
  const { scoreResult, dimensionScores, aiRecommendation, userProfile } = result;

  // Brand Colors - Consistent palette
  const brandPurple = [124, 58, 237]; // Primary
  const brandGreen = [16, 185, 129]; // Success
  const brandYellow = [245, 158, 11]; // Warning
  const brandOrange = [249, 115, 22]; // Orange light
  const brandRed = [239, 68, 68]; // Red light
  const lightBg = [249, 250, 251];
  const textDark = [31, 41, 55];
  const textGray = [107, 114, 128];

  // Get status color based on score level
  const getStatusColor = (): number[] => {
    const level = scoreResult.level.toLowerCase();
    if (level.includes('green')) return brandGreen;
    if (level.includes('yellow')) return brandYellow;
    if (level.includes('orange')) return brandOrange;
    if (level.includes('red')) return brandRed;
    return textGray;
  };

  // Get status text
  const getStatusText = (): string => {
    // Handle both old format ('green', 'yellow', 'red') and new format ('Green Light', etc.)
    if (typeof scoreResult.level === 'string') {
      if (scoreResult.level.includes('Light')) {
        return scoreResult.level; // Already formatted
      }
      // Convert old format to new
      const level = scoreResult.level.toLowerCase();
      if (level === 'green') return 'Green Light';
      if (level === 'yellow') return 'Yellow Light';
      if (level === 'red') return 'Red Light';
    }
    return 'Assessment';
  };

  const statusColor = getStatusColor();

  // Helper: Add consistent header across pages
  const addPageHeader = (title: string, yPos = 20) => {
    doc.setFillColor(brandPurple[0], brandPurple[1], brandPurple[2]);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, yPos);
  };

  // Helper: Add footer with branding
  const addPageFooter = () => {
    doc.setFontSize(9);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Powered by BeamX Solutions | www.beamxsolutions.com', 105, 285, { align: 'center' });
  };

  // ===== PAGE 1: COVER PAGE =====

  // Purple gradient background (simulated with rectangle)
  doc.setFillColor(brandPurple[0], brandPurple[1], brandPurple[2]);
  doc.rect(0, 0, 210, 140, 'F');

  // Add logo placeholder (text-based since we need to load image)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BeamX', 20, 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('SOLUTIONS', 20, 26);

  // Main title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('BUSINESS IDEA', 105, 60, { align: 'center' });
  doc.text('VALIDATION REPORT', 105, 73, { align: 'center' });

  // Score circle
  doc.setFillColor(255, 255, 255);
  doc.circle(105, 105, 24, 'F');
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.circle(105, 105, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(`${scoreResult.score}%`, 105, 112, { align: 'center' });

  // Status badge
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(65, 145, 80, 14, 3, 3, 'F');
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(getStatusText(), 105, 154, { align: 'center' });

  // User info card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(30, 175, 150, 45, 4, 4, 'F');

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(userProfile.name || 'Entrepreneur', 105, 192, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.setFont('helvetica', 'normal');
  const userDetails = [userProfile.industry, userProfile.location].filter(Boolean).join(' • ');
  if (userDetails) {
    doc.text(userDetails, 105, 202, { align: 'center' });
  }

  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.setFontSize(10);
  doc.text(reportDate, 105, 212, { align: 'center' });

  // Bottom tagline
  doc.setFontSize(10);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text('Powered by BeamX Solutions', 105, 270, { align: 'center' });
  doc.setFontSize(9);
  doc.text('Data-Driven Startup Validation', 105, 277, { align: 'center' });

  // ===== PAGE 2: EXECUTIVE SUMMARY =====
  doc.addPage();
  addPageHeader('EXECUTIVE SUMMARY');

  let yPos = 50;

  // Score overview card
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(20, yPos, 170, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${getStatusText()} - ${scoreResult.totalPositive}/10`, 25, yPos + 6);

  yPos += 15;

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryLines = doc.splitTextToSize(scoreResult.summary, 165);
  doc.text(summaryLines, 25, yPos);
  yPos += summaryLines.length * 5 + 10;

  // Readiness metrics box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(20, yPos, 170, 40, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setTextColor(brandPurple[0], brandPurple[1], brandPurple[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('READINESS METRICS', 25, yPos + 10);

  doc.setFontSize(10);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(`Overall Score: ${scoreResult.score}% (${scoreResult.totalPositive}/10 positive)`, 25, yPos + 20);
  doc.text(`Status: ${getStatusText().toUpperCase()}`, 25, yPos + 27);
  doc.text(`Timeframe: ${scoreResult.timeframe}`, 25, yPos + 34);

  yPos += 50;

  // Immediate next steps
  doc.setFontSize(14);
  doc.setTextColor(brandPurple[0], brandPurple[1], brandPurple[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Immediate Next Steps', 25, yPos);
  yPos += 10;

  scoreResult.actionItems.slice(0, 3).forEach((item, idx) => {
    // Checkbox
    doc.setDrawColor(brandPurple[0], brandPurple[1], brandPurple[2]);
    doc.setLineWidth(0.5);
    doc.rect(25, yPos - 3, 4, 4);

    doc.setFontSize(10);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'normal');
    const itemLines = doc.splitTextToSize(`${idx + 1}. ${item}`, 155);
    doc.text(itemLines, 32, yPos);
    yPos += itemLines.length * 5 + 3;
  });

  addPageFooter();

  // ===== PAGE 3: DIMENSION ANALYSIS =====
  doc.addPage();
  addPageHeader('DIMENSION ANALYSIS');

  yPos = 50;

  // Create dimension table data
  const dimensionTableData = dimensionScores.map((dim) => {
    const progress = dim.maxScore > 0 ? Math.round((dim.score / dim.maxScore) * 100) : 0;
    const status = progress === 100 ? '✓ Strong' : progress >= 50 ? '◐ Moderate' : '○ Needs Work';

    return [
      dim.name,
      `${dim.score}/${dim.maxScore}`,
      status,
      `${progress}%`,
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Dimension', 'Score', 'Status', 'Progress']],
    body: dimensionTableData,
    theme: 'striped',
    headStyles: {
      fillColor: [124, 58, 237],
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'left',
      textColor: [255, 255, 255],
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 45, halign: 'center' },
      3: { cellWidth: 35, halign: 'center' },
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    styles: {
      fontSize: 10,
      cellPadding: 6,
      font: 'helvetica',
    },
    didParseCell: function (data) {
      if (data.row.index >= 0 && data.column.index === 2) {
        const cellText = data.cell.text[0];
        if (cellText.includes('Strong')) {
          data.cell.styles.textColor = [16, 185, 129];
          data.cell.styles.fontStyle = 'bold';
        } else if (cellText.includes('Moderate')) {
          data.cell.styles.textColor = [245, 158, 11];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Strengths and weaknesses summary
  doc.setFontSize(13);
  doc.setTextColor(brandPurple[0], brandPurple[1], brandPurple[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Your Strengths & Opportunities', 25, yPos);
  yPos += 10;

  const strongDims = dimensionScores.filter((d) => d.score === d.maxScore);
  const weakDims = dimensionScores.filter((d) => d.score < d.maxScore);

  if (strongDims.length > 0) {
    doc.setFillColor(16, 185, 129);
    doc.circle(27, yPos - 2, 2, 'F');
    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text('Strengths:', 32, yPos);

    doc.setFontSize(10);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(strongDims.map((d) => d.name).join(', '), 32, yPos + 6);
    yPos += 16;
  }

  if (weakDims.length > 0) {
    doc.setFillColor(249, 115, 22);
    doc.circle(27, yPos - 2, 2, 'F');
    doc.setFontSize(11);
    doc.setTextColor(249, 115, 22);
    doc.setFont('helvetica', 'bold');
    doc.text('Areas for Improvement:', 32, yPos);

    doc.setFontSize(10);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'normal');
    const weakText = doc.splitTextToSize(weakDims.map((d) => d.name).join(', '), 155);
    doc.text(weakText, 32, yPos + 6);
  }

  addPageFooter();

  // ===== AI RECOMMENDATIONS PAGES =====
  if (aiRecommendation) {
    // PAGE 4: Strengths & Gaps
    doc.addPage();
    addPageHeader('AI-POWERED INSIGHTS');

    yPos = 50;

    // Strengths section
    doc.setFillColor(236, 253, 245); // Light green bg
    const strengthsHeight = 15 + aiRecommendation.strengths.length * 12;
    doc.roundedRect(20, yPos, 170, strengthsHeight, 3, 3, 'F');

    doc.setFontSize(13);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text('✓  Your Key Strengths', 25, yPos + 10);

    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'normal');
    let innerY = yPos + 18;

    aiRecommendation.strengths.forEach((strength) => {
      const lines = doc.splitTextToSize(`• ${strength}`, 160);
      doc.text(lines, 27, innerY);
      innerY += lines.length * 4.5;
    });

    yPos += strengthsHeight + 10;

    // Gaps section
    doc.setFillColor(255, 247, 237); // Light orange bg
    const gapsHeight = 15 + aiRecommendation.gaps.length * 12;
    doc.roundedRect(20, yPos, 170, gapsHeight, 3, 3, 'F');

    doc.setFontSize(13);
    doc.setTextColor(249, 115, 22);
    doc.setFont('helvetica', 'bold');
    doc.text('⚠  Critical Gaps to Address', 25, yPos + 10);

    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'normal');
    innerY = yPos + 18;

    aiRecommendation.gaps.forEach((gap) => {
      const lines = doc.splitTextToSize(`• ${gap}`, 160);
      doc.text(lines, 27, innerY);
      innerY += lines.length * 4.5;
    });

    addPageFooter();

    // PAGE 5: Personalized Plan
    doc.addPage();
    addPageHeader('YOUR ACTION PLAN');

    yPos = 50;
    doc.setFontSize(10);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'normal');
    const planLines = doc.splitTextToSize(aiRecommendation.personalizedPlan, 165);
    doc.text(planLines, 25, yPos);

    addPageFooter();

    // PAGE 6+: Weekly Roadmap
    doc.addPage();
    addPageHeader('WEEKLY ROADMAP');

    yPos = 50;

    aiRecommendation.weeklyRoadmap.forEach((week) => {
      if (yPos > 240) {
        doc.addPage();
        addPageHeader('WEEKLY ROADMAP (continued)');
        yPos = 50;
      }

      // Week header
      doc.setFillColor(brandPurple[0], brandPurple[1], brandPurple[2]);
      doc.roundedRect(20, yPos, 170, 10, 2, 2, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Week ${week.week}`, 25, yPos + 7);

      yPos += 15;

      // Tasks
      doc.setFontSize(9);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFont('helvetica', 'normal');

      week.tasks.forEach((task) => {
        if (yPos > 260) {
          doc.addPage();
          addPageHeader('WEEKLY ROADMAP (continued)');
          yPos = 50;
        }

        // Checkbox
        doc.setDrawColor(brandPurple[0], brandPurple[1], brandPurple[2]);
        doc.setLineWidth(0.4);
        doc.rect(25, yPos - 3, 3.5, 3.5);

        const taskLines = doc.splitTextToSize(task, 155);
        doc.text(taskLines, 31, yPos);
        yPos += taskLines.length * 4.5 + 2;
      });

      yPos += 8;
    });

    addPageFooter();

    // PAGE: Resources
    doc.addPage();
    addPageHeader('RECOMMENDED RESOURCES');

    yPos = 50;

    aiRecommendation.resources.forEach((resource) => {
      if (yPos > 240) {
        doc.addPage();
        addPageHeader('RECOMMENDED RESOURCES (continued)');
        yPos = 50;
      }

      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.roundedRect(20, yPos, 170, 28, 3, 3, 'F');

      doc.setFontSize(11);
      doc.setTextColor(brandPurple[0], brandPurple[1], brandPurple[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(resource.title, 25, yPos + 9);

      doc.setFontSize(9);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(resource.description, 160);
      doc.text(descLines, 25, yPos + 16);

      yPos += 33;
    });

    addPageFooter();

    // PAGE: Risk Assessment
    doc.addPage();
    addPageHeader('RISK ASSESSMENT');

    doc.setFillColor(254, 242, 242); // Light red bg
    doc.roundedRect(20, 50, 170, 100, 3, 3, 'F');

    doc.setFontSize(10);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'normal');
    const riskLines = doc.splitTextToSize(aiRecommendation.riskAssessment, 160);
    doc.text(riskLines, 25, 60);

    addPageFooter();
  }

  // ===== FINAL PAGE: CALL TO ACTION =====
  doc.addPage();

  // Full page gradient background
  doc.setFillColor(brandPurple[0], brandPurple[1], brandPurple[2]);
  doc.rect(0, 0, 210, 297, 'F');

  // White content card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(30, 70, 150, 140, 5, 5, 'F');

  doc.setTextColor(brandPurple[0], brandPurple[1], brandPurple[2]);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Ready to Take Action?', 105, 100, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('BeamX Solutions is here to help you succeed', 105, 115, { align: 'center' });

  yPos = 135;
  doc.setFontSize(11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('📞  Free 30-Min Consultation', 105, yPos, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(brandPurple[0], brandPurple[1], brandPurple[2]);
  doc.text('www.beamxsolutions.com', 105, yPos + 6, { align: 'center' });

  yPos += 20;
  doc.setFontSize(10);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('💡  1-on-1 Validation Session: $97', 105, yPos, { align: 'center' });

  yPos += 10;
  doc.text('🚀  "Idea to Launch" Program: $497', 105, yPos, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('© 2024 BeamX Solutions. All rights reserved.', 105, 280, { align: 'center' });

  return doc;
}
