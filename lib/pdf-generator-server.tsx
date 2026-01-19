import { renderToBuffer } from '@react-pdf/renderer';
import { AssessmentResult } from '@/types';
import { PDFDocument } from './pdf-document';

/**
 * Server-side PDF generation for email attachments
 * Uses React PDF's renderToBuffer for Node.js environments
 *
 * @param result - Assessment result data
 * @returns Buffer - PDF file as buffer for email attachment
 */
export async function generatePDFBuffer(result: AssessmentResult): Promise<Buffer> {
  try {
    const buffer = await renderToBuffer(<PDFDocument result={result} />);
    return buffer;
  } catch (error) {
    console.error('Server PDF generation error:', error);
    throw new Error('Failed to generate PDF report on server');
  }
}
