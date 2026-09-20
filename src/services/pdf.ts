import * as pdfjsLib from 'pdfjs-dist';

// Set up pdf.js worker URL
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

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
    // Estimate page count for text file (~2500 chars per page)
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
