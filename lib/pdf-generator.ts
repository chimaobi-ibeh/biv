import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AssessmentResult } from '@/types';

export function generatePDFReport(result: AssessmentResult): jsPDF {
  const doc = new jsPDF();
  const { scoreResult, dimensionScores, aiRecommendation, userProfile } = result;

  // Page 1: Cover Page
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, 210, 80, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.text('Business Idea', 105, 30, { align: 'center' });
  doc.text('Validation Report', 105, 45, { align: 'center' });

  doc.setFontSize(48);
  doc.text(`${scoreResult.score}%`, 105, 65, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text(userProfile.name || 'Entrepreneur', 105, 100, { align: 'center' });

  doc.setFontSize(12);
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(date, 105, 110, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Powered by BeamX Solutions', 105, 280, { align: 'center' });

  // Page 2: Executive Summary
  doc.addPage();
  doc.setFontSize(20);
  doc.setTextColor(102, 126, 234);
  doc.text('Executive Summary', 20, 20);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(scoreResult.title, 20, 35);

  doc.setFontSize(11);
  const summaryLines = doc.splitTextToSize(scoreResult.summary, 170);
  doc.text(summaryLines, 20, 45);

  // Score breakdown box
  doc.setDrawColor(102, 126, 234);
  doc.setLineWidth(0.5);
  doc.rect(20, 70, 170, 40);

  doc.setFontSize(10);
  doc.setTextColor(102, 126, 234);
  doc.text('READINESS ASSESSMENT', 25, 77);

  doc.setTextColor(0, 0, 0);
  doc.text(`Overall Score: ${scoreResult.score}% (${scoreResult.totalPositive}/10)`, 25, 87);
  doc.text(`Status: ${scoreResult.level.toUpperCase()} LIGHT`, 25, 95);
  doc.text(`Recommended Timeframe: ${scoreResult.timeframe}`, 25, 103);

  // Next steps
  doc.setFontSize(14);
  doc.setTextColor(102, 126, 234);
  doc.text('Immediate Next Steps', 20, 125);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  let yPos = 135;
  scoreResult.actionItems.forEach((item, index) => {
    const lines = doc.splitTextToSize(`${index + 1}. ${item}`, 165);
    doc.text(lines, 25, yPos);
    yPos += lines.length * 6;
  });

  // Page 3: Dimension Analysis
  doc.addPage();
  doc.setFontSize(20);
  doc.setTextColor(102, 126, 234);
  doc.text('Detailed Dimension Analysis', 20, 20);

  const dimensionData = dimensionScores.map((dim) => [
    dim.name,
    `${dim.score}/${dim.maxScore}`,
    dim.score === dim.maxScore ? '✓ Strong' : '⚠ Needs Work',
  ]);

  autoTable(doc, {
    startY: 30,
    head: [['Dimension', 'Score', 'Status']],
    body: dimensionData,
    theme: 'striped',
    headStyles: { fillColor: [102, 126, 234] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  // Page 4-5: AI Recommendations (if available)
  if (aiRecommendation) {
    doc.addPage();
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('AI-Powered Recommendations', 20, 20);

    // Strengths
    doc.setFontSize(14);
    doc.setTextColor(0, 150, 0);
    doc.text('Your Strengths', 20, 35);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    let yPosition = 45;
    aiRecommendation.strengths.forEach((strength, index) => {
      const lines = doc.splitTextToSize(`✓ ${strength}`, 165);
      doc.text(lines, 25, yPosition);
      yPosition += lines.length * 6;
    });

    // Gaps
    yPosition += 10;
    doc.setFontSize(14);
    doc.setTextColor(200, 0, 0);
    doc.text('Areas for Improvement', 20, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    aiRecommendation.gaps.forEach((gap, index) => {
      const lines = doc.splitTextToSize(`• ${gap}`, 165);
      doc.text(lines, 25, yPosition);
      yPosition += lines.length * 6;
    });

    // Personalized Plan
    doc.addPage();
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('Your Personalized Action Plan', 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const planLines = doc.splitTextToSize(aiRecommendation.personalizedPlan, 170);
    doc.text(planLines, 20, 35);

    // Weekly Roadmap
    let roadmapY = 35 + planLines.length * 6 + 15;
    doc.setFontSize(14);
    doc.setTextColor(102, 126, 234);
    doc.text('Week-by-Week Roadmap', 20, roadmapY);

    roadmapY += 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    aiRecommendation.weeklyRoadmap.forEach((week) => {
      if (roadmapY > 250) {
        doc.addPage();
        roadmapY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`Week ${week.week}:`, 20, roadmapY);
      doc.setFont('helvetica', 'normal');
      roadmapY += 7;

      week.tasks.forEach((task) => {
        const taskLines = doc.splitTextToSize(`□ ${task}`, 165);
        doc.text(taskLines, 25, roadmapY);
        roadmapY += taskLines.length * 6;
      });

      roadmapY += 5;
    });

    // Resources
    doc.addPage();
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('Recommended Resources', 20, 20);

    let resourceY = 35;
    aiRecommendation.resources.forEach((resource) => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(resource.title, 20, resourceY);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(resource.description, 170);
      doc.text(descLines, 20, resourceY + 7);

      resourceY += descLines.length * 6 + 12;

      if (resourceY > 250) {
        doc.addPage();
        resourceY = 20;
      }
    });

    // Risk Assessment
    doc.addPage();
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('Risk Assessment & Mitigation', 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const riskLines = doc.splitTextToSize(aiRecommendation.riskAssessment, 170);
    doc.text(riskLines, 20, 35);
  }

  // Final Page: Call to Action
  doc.addPage();
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('Ready to Take Action?', 105, 80, { align: 'center' });

  doc.setFontSize(14);
  doc.text('BeamX Solutions is here to help you succeed', 105, 100, { align: 'center' });

  doc.setFontSize(12);
  doc.text('Book a free consultation:', 105, 130, { align: 'center' });
  doc.text('www.beamxsolutions.com', 105, 145, { align: 'center' });

  doc.setFontSize(10);
  doc.text('1-on-1 Validation Session: $97', 105, 170, { align: 'center' });
  doc.text('"Idea to Launch" Program: $497', 105, 180, { align: 'center' });

  return doc;
}
