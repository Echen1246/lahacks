'use client';

import { useCallback, useEffect, useRef } from 'react';
import { extractTextFromImage, extractTextFromPDF } from '../services/textExtractor';

interface FileProcessorProps {
  onTextExtracted: (text: string) => void;
  onError: (error: string) => void;
  onProcessingChange: (isProcessing: boolean) => void;
  file: File | null;
}

export default function FileProcessor({ file, onTextExtracted, onError, onProcessingChange }: FileProcessorProps) {
  // Use ref to track if we've processed this file already
  const processedFileRef = useRef<File | null>(null);
  
  const processFile = useCallback(async (fileToProcess: File) => {
    if (!fileToProcess) return;
    
    // Skip if we've already processed this exact file object
    if (processedFileRef.current === fileToProcess) {
      return;
    }
    
    // Mark this file as being processed
    processedFileRef.current = fileToProcess;
    onProcessingChange(true);
    
    try {
      // Extract text from the file based on its type
      let text = '';
      
      if (fileToProcess.type.includes('image')) {
        text = await extractTextFromImage(fileToProcess);
      } else if (fileToProcess.type === 'application/pdf') {
        text = await extractTextFromPDF(fileToProcess);
      } else if (fileToProcess.type === 'text/plain') {
        text = await fileToProcess.text();
      }

      if (!text.trim()) {
        throw new Error('No text could be extracted from the file.');
      }

      onTextExtracted(text);
    } catch (err) {
      console.error('Error processing file:', err);
      onError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      onProcessingChange(false);
    }
  }, [onTextExtracted, onError, onProcessingChange]);
  
  // Use useEffect to process file when it changes
  useEffect(() => {
    if (file) {
      processFile(file);
    }
  }, [file, processFile]);
  
  // This component doesn't render anything visible
  return null;
} 