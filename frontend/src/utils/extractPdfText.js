// Helper to extract text from a PDF file using pdfjs-dist
import { getDocument } from 'pdfjs-dist';

/**
 * Extracts all text from a PDF file URL using pdfjs-dist
 * @param {string} url - The URL of the PDF file
 * @returns {Promise<string>} - The extracted text
 */
export default async function extractPdfText(url) {
  if (!url) throw new Error('No PDF URL provided');
  const loadingTask = getDocument(url);
  const pdf = await loadingTask.promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return text;
}
