import { getDocument, GlobalWorkerOptions, version as pdfjsVersion } from 'pdfjs-dist';

// Set workerSrc for pdfjs
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;

const extractPdfText = async (pdfUrl: string): Promise<string> => {
  const loadingTask = getDocument(pdfUrl);
  const pdf = await loadingTask.promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: import('pdfjs-dist/types/src/display/api').TextItem) => item.str).join(' ') + '\n';
  }
  return text;
};

export default extractPdfText;