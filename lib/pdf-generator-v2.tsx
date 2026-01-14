import { pdf } from '@react-pdf/renderer';
import { AssessmentResult } from '@/types';
import { PDFDocument } from './pdf-document';

/**
 * Professional PDF Report Generator using React PDF
 *
 * This implementation uses a proper document rendering system with:
 * - Strict design system with defined colors, spacing, and typography
 * - Layout-driven approach with explicit styles for every component
 * - Predictable line wrapping and text rendering
 * - Structured sections with consistent spacing
 * - Professional table rendering with proper grids
 * - Font hierarchy support
 *
 * @param result - Assessment result data
 * @returns Blob - PDF file as blob
 */
export async function generatePDFReportV2(result: AssessmentResult): Promise<Blob> {
  try {
    // Generate PDF using React PDF renderer
    const blob = await pdf(<PDFDocument result={result} />).toBlob();
    return blob;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF report');
  }
}

/**
 * Generate and download PDF report
 * @param result - Assessment result data
 * @param filename - Optional custom filename
 */
export async function downloadPDFReport(
  result: AssessmentResult,
  filename?: string
): Promise<void> {
  try {
    const blob = await generatePDFReportV2(result);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `business-idea-validation-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF download error:', error);
    throw error;
  }
}
