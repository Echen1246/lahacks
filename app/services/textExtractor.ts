import { createWorker } from 'tesseract.js';

// Only available in browser
const isPdfJsAvailable = typeof window !== 'undefined';

/**
 * Extract text from an image using Tesseract OCR
 */
export async function extractTextFromImage(imageFile: File): Promise<string> {
  try {
    const worker = await createWorker();
    const imageData = await readFileAsDataURL(imageFile);
    const { data } = await worker.recognize(imageData);
    await worker.terminate();
    return data.text;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Extract text from a PDF file using PDF.js
 */
export async function extractTextFromPDF(pdfFile: File): Promise<string> {
  try {
    if (!isPdfJsAvailable) {
      throw new Error('PDF.js is not available in this environment');
    }

    const arrayBuffer = await readFileAsArrayBuffer(pdfFile);
    
    // Dynamically import PDF.js to ensure it only loads on client side
    const pdfjsLib = await import('pdfjs-dist');
    
    // Configure worker to use the local file
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    
    try {
      // Get the binary data
      const data = new Uint8Array(arrayBuffer);
      
      // Create a document - without web worker to avoid issues
      const loadingTask = pdfjsLib.getDocument({ data });
      const pdf = await loadingTask.promise;
      
      console.log('PDF loaded successfully with', pdf.numPages, 'pages');
      
      let fullText = '';
      
      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log('Processing page', i);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // Handle union type: Check if item has 'str' property
        const textItems = textContent.items
          .map((item) => ('str' in item ? item.str : '')) // Get str if TextItem, else empty string
          .filter(str => str.trim().length > 0); // Filter out empty strings
        fullText += textItems.join(' ') + '\n';
      }
      
      if (!fullText.trim()) {
        console.warn('No text extracted from PDF, possibly a scanned document');
      }
      
      return fullText;
    } catch (error: unknown) {
      console.error('PDF parsing error:', error);
      const message = error instanceof Error ? error.message : 'Unknown PDF parsing error';
      throw new Error(`PDF parsing error: ${message}`);
    }
  } catch (error: unknown) {
    console.error('Error extracting text from PDF:', error);
    const message = error instanceof Error ? error.message : 'Unknown error extracting PDF text';
    throw new Error(`Failed to extract text from PDF: ${message}`);
  }
}

/**
 * Helper function to read a file as a data URL
 */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Helper function to read a file as an ArrayBuffer
 */
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
} 