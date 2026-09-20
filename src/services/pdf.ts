import * as pdfjsLib from 'pdfjs-dist';
// Import pdfjs worker URL via Vite URL import for 100% offline support on any PC
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface ExtractedDocument {
  text: string;
  pageCount: number;
}

export async function extractTextFromFile(file: File): Promise<ExtractedDocument> {
  const fileType = file.name.split('.').pop()?.toLowerCase();

  if (fileType === 'pdf') {
    return await extractTextFromPDF(file);
  } else if (fileType === 'txt' || fileType === 'md') {
    const text = await file.text();
    const pageCount = Math.max(1, Math.ceil(text.length / 2500));
    return { text, pageCount };
  } else {
    throw new Error(`Unsupported file extension: .${fileType}. Please upload PDF, TXT, or MD files.`);
  }
}

async function extractTextFromPDF(file: File): Promise<ExtractedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += `--- Page ${i} ---\n${pageText}\n\n`;
  }

  return { text: fullText, pageCount: numPages };
}
