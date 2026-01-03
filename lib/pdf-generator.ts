import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AssessmentResult } from '@/types';

export function generatePDFReport(result: AssessmentResult): jsPDF {
  const doc = new jsPDF();
  const { scoreResult, dimensionScores, aiRecommendation, userProfile } = result;

  // Brand Colors
  const brandPurple = [36, 94, 166];
  const brandBlue = [59, 130, 246];
  const brandGreen = [34, 197, 94];
  const brandOrange = [249, 115, 22];
  const brandRed = [239, 68, 68];
  const lightGray = [249, 250, 251];
  const mediumGray = [156, 163, 175];

  // Helper function to add gradient background
  const addGradientHeader = (y: number, height: number) => {
    doc.setFillColor(brandPurple[0], brandPurple[1], brandPurple[2]);
    doc.rect(0, y, 105, height, 'F');
    doc.setFillColor(brandBlue[0], brandBlue[1], brandBlue[2]);
    doc.rect(105, y, 105, height, 'F');
  };

  // Helper for colored boxes
  const addColoredBox = (x: number, y: number, w: number, h: number, color: number[], text: string) => {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(x, y, w, h, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(text, x + w / 2, y + h / 2 + 2, { align: 'center' });
  };

  // Get status color
  const getStatusColor = () => {
    switch (scoreResult.level) {
      case 'green':
        return brandGreen;
      case 'yellow':
        return brandOrange;
      case 'red':
        return brandRed;
      default:
        return mediumGray;
    }
  };

  // ===== PAGE 1: COVER PAGE =====
  addGradientHeader(0, 120);

  // Decorative circles
  doc.setFillColor(255, 255, 255);
  doc.setGState(doc.GState({ opacity: 0.1 }));
  doc.circle(30, 30, 40, 'F');
  doc.circle(180, 80, 50, 'F');
  doc.circle(160, 30, 25, 'F');
  doc.setGState(doc.GState({ opacity: 1 }));

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(38);
  doc.text('BUSINESS IDEA', 105, 45, { align: 'center' });
  doc.setFontSize(36);
  doc.text('VALIDATION REPORT', 105, 60, { align: 'center' });

  // Score Circle
  const statusColor = getStatusColor();
  doc.setFillColor(255, 255, 255);
  doc.circle(105, 90, 22, 'F');
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.circle(105, 90, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(`${scoreResult.score}%`, 105, 95, { align: 'center' });

  // Status Badge
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(75, 130, 60, 12, 2, 2, 'F');
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(scoreResult.title.split('-')[0].trim(), 105, 138, { align: 'center' });

  // User Info Section
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(40, 155, 130, 35, 3, 3, 'F');

  doc.setTextColor(51, 51, 51);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(userProfile.name || 'Entrepreneur', 105, 168, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  if (userProfile.industry || userProfile.location) {
    const details = [userProfile.industry, userProfile.location].filter(Boolean).join(' • ');
    doc.text(details, 105, 176, { align: 'center' });
  }

  // Date
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.setFontSize(9);
  doc.text(date, 105, 184, { align: 'center' });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(156, 163, 175);
  doc.text('Powered by BeamX Solutions', 105, 275, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Data-Driven Startup Validation', 105, 282, { align: 'center' });

  // ===== PAGE 2: EXECUTIVE SUMMARY =====
  doc.addPage();

  // Header
  addGradientHeader(0, 35);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE SUMMARY', 20, 22);

  // Score Status Box
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(15, 45, 180, 55, 4, 4, 'F');

  // White inner box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 50, 170, 45, 3, 3, 'F');

  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(scoreResult.title, 25, 60);

  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.setFont('helvetica', 'normal');
  const summaryLines = doc.splitTextToSize(scoreResult.summary, 160);
  doc.text(summaryLines, 25, 70);

  // Score Metrics
  let yPos = 110;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(15, yPos, 180, 35, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'bold');
  doc.text('READINESS METRICS', 20, yPos + 8);

  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(`Overall Score: ${scoreResult.score}% (${scoreResult.totalPositive}/10 positive)`, 20, yPos + 18);
  doc.text(`Status: ${scoreResult.level.toUpperCase()} LIGHT`, 20, yPos + 26);
  doc.text(`Timeframe: ${scoreResult.timeframe}`, 20, yPos + 34);

  // Next Steps
  yPos = 155;
  doc.setFontSize(16);
  doc.setTextColor(brandPurple[0], brandPurple[1], brandPurple[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Immediate Next Steps', 20, yPos);

  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.setFont('helvetica', 'normal');
  yPos += 12;

  scoreResult.actionItems.forEach((item, index) => {
    // Checkbox
    doc.setDrawColor(124, 58, 237);
    doc.setLineWidth(0.5);
    doc.rect(20, yPos - 3, 4, 4);

    const lines = doc.splitTextToSize(`${index + 1}. ${item}`, 160);
    doc.text(lines, 28, yPos);
    yPos += lines.length * 6 + 2;
  });

  // ===== PAGE 3: DIMENSION ANALYSIS =====
  doc.addPage();

  // Header
  addGradientHeader(0, 35);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('DIMENSION ANALYSIS', 20, 22);

  // Dimensions Table
  const dimensionData = dimensionScores.map((dim) => [
    dim.name,
    `${dim.score}/${dim.maxScore}`,
    dim.score === dim.maxScore ? '✓ Strong' : '○ Needs Work',
    dim.score === dim.maxScore ? '100%' : '0%',
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['Dimension', 'Score', 'Status', 'Progress']],
    body: dimensionData,
    theme: 'grid',
    headStyles: {
      fillColor: [124, 58, 237],
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 50, halign: 'center' },
      3: { cellWidth: 40, halign: 'center' },
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    didParseCell: function (data) {
      if (data.row.index >= 0 && data.column.index === 2) {
        const cell = data.cell;
        if (cell.text[0].includes('Strong')) {
          cell.styles.textColor = [34, 197, 94];
          cell.styles.fontStyle = 'bold';
        } else {
          cell.styles.textColor = [249, 115, 22];
        }
      }
    },
  });

  // Visual Score Summary
  const tableEnd = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setTextColor(124, 58, 237);
  doc.setFont('helvetica', 'bold');
  doc.text('Your Strengths & Opportunities', 20, tableEnd);

  const strongDimensions = dimensionScores.filter((d) => d.score === d.maxScore);
  const weakDimensions = dimensionScores.filter((d) => d.score < d.maxScore);

  yPos = tableEnd + 10;

  // Strengths
  if (strongDimensions.length > 0) {
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(18, yPos - 4, 4, 4, 1, 1, 'F');
    doc.setFontSize(11);
    doc.setTextColor(34, 197, 94);
    doc.setFont('helvetica', 'bold');
    doc.text('Strengths:', 25, yPos);

    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'normal');
    doc.text(strongDimensions.map((d) => d.name).join(', '), 25, yPos + 6);
    yPos += 15;
  }

  // Opportunities
  if (weakDimensions.length > 0) {
    doc.setFillColor(249, 115, 22);
    doc.roundedRect(18, yPos - 4, 4, 4, 1, 1, 'F');
    doc.setFontSize(11);
    doc.setTextColor(249, 115, 22);
    doc.setFont('helvetica', 'bold');
    doc.text('Areas for Improvement:', 25, yPos);

    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'normal');
    doc.text(weakDimensions.map((d) => d.name).join(', '), 25, yPos + 6);
  }

  // ===== AI RECOMMENDATIONS (if available) =====
  if (aiRecommendation) {
    // PAGE 4: Strengths & Gaps
    doc.addPage();
    addGradientHeader(0, 35);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('AI-POWERED INSIGHTS', 20, 22);

    yPos = 50;

    // Strengths Section
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(15, yPos, 180, 10 + aiRecommendation.strengths.length * 8, 3, 3, 'F');

    doc.setFontSize(13);
    doc.setTextColor(34, 197, 94);
    doc.setFont('helvetica', 'bold');
    doc.text('✓ Your Key Strengths', 20, yPos + 7);

    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'normal');
    yPos += 14;

    aiRecommendation.strengths.forEach((strength) => {
      const strengthLines = doc.splitTextToSize(`• ${strength}`, 170);
      doc.text(strengthLines, 22, yPos);
      yPos += strengthLines.length * 5;
    });

    // Gaps Section
    yPos += 8;
    doc.setFillColor(255, 247, 237);
    doc.roundedRect(15, yPos, 180, 10 + aiRecommendation.gaps.length * 8, 3, 3, 'F');

    doc.setFontSize(13);
    doc.setTextColor(249, 115, 22);
    doc.setFont('helvetica', 'bold');
    doc.text('⚠ Critical Gaps to Address', 20, yPos + 7);

    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'normal');
    yPos += 14;

    aiRecommendation.gaps.forEach((gap) => {
      const gapLines = doc.splitTextToSize(`• ${gap}`, 170);
      doc.text(gapLines, 22, yPos);
      yPos += gapLines.length * 5;
    });

    // PAGE 5: Personalized Plan
    doc.addPage();
    addGradientHeader(0, 35);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('YOUR ACTION PLAN', 20, 22);

    yPos = 50;
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'normal');
    const planLines = doc.splitTextToSize(aiRecommendation.personalizedPlan, 170);
    doc.text(planLines, 20, yPos);

    // PAGE 6: Weekly Roadmap
    doc.addPage();
    addGradientHeader(0, 35);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('WEEKLY ROADMAP', 20, 22);

    yPos = 50;

    aiRecommendation.weeklyRoadmap.forEach((week) => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      // Week Header
      doc.setFillColor(124, 58, 237);
      doc.roundedRect(15, yPos, 180, 10, 3, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Week ${week.week}`, 20, yPos + 7);

      yPos += 15;

      // Tasks
      doc.setFontSize(9);
      doc.setTextColor(55, 65, 81);
      doc.setFont('helvetica', 'normal');

      week.tasks.forEach((task) => {
        doc.setDrawColor(124, 58, 237);
        doc.rect(20, yPos - 3, 3, 3);
        const taskLines = doc.splitTextToSize(task, 160);
        doc.text(taskLines, 27, yPos);
        yPos += taskLines.length * 5 + 2;
      });

      yPos += 5;
    });

    // PAGE 7: Resources
    doc.addPage();
    addGradientHeader(0, 35);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMMENDED RESOURCES', 20, 22);

    yPos = 50;

    aiRecommendation.resources.forEach((resource) => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(249, 250, 251);
      doc.roundedRect(15, yPos, 180, 25, 3, 3, 'F');

      doc.setFontSize(11);
      doc.setTextColor(124, 58, 237);
      doc.setFont('helvetica', 'bold');
      doc.text(resource.title, 20, yPos + 8);

      doc.setFontSize(9);
      doc.setTextColor(55, 65, 81);
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(resource.description, 170);
      doc.text(descLines, 20, yPos + 15);

      yPos += 30;
    });

    // PAGE 8: Risk Assessment
    doc.addPage();
    addGradientHeader(0, 35);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('RISK ASSESSMENT', 20, 22);

    doc.setFillColor(254, 242, 242);
    doc.roundedRect(15, 50, 180, 80, 3, 3, 'F');

    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'normal');
    const riskLines = doc.splitTextToSize(aiRecommendation.riskAssessment, 170);
    doc.text(riskLines, 20, 60);
  }

  // ===== FINAL PAGE: CALL TO ACTION =====
  doc.addPage();
  addGradientHeader(0, 297);

  // White content box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(30, 80, 150, 120, 5, 5, 'F');

  doc.setTextColor(124, 58, 237);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('Ready to Take Action?', 105, 110, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(75, 85, 99);
  doc.setFont('helvetica', 'normal');
  doc.text('BeamX Solutions is here to help you succeed', 105, 125, { align: 'center' });

  // Offerings
  yPos = 145;
  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.text('📞 Free 30-Min Consultation', 105, yPos, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('www.beamxsolutions.com', 105, yPos + 6, { align: 'center' });

  yPos += 18;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('💡 1-on-1 Validation Session: $97', 105, yPos, { align: 'center' });

  yPos += 8;
  doc.text('🚀 "Idea to Launch" Program: $497', 105, yPos, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.setFont('helvetica', 'normal');
  doc.text('© 2024 BeamX Solutions. All rights reserved.', 105, 280, { align: 'center' });

  return doc;
}
