'use client';

import { useCallback, useEffect, useRef } from 'react';
import { extractTextFromImage, extractTextFromPDF } from '../services/textExtractor';

interface FileProcessorProps {
  onTextExtracted: (text: string) => void;
  onError: (error: string) => void;
  onProcessingChange: (isProcessing: boolean) => void;
  onStageChange: (stage: string | null) => void;
  file: File | null;
}

export default function FileProcessor({ file, onTextExtracted, onError, onProcessingChange, onStageChange }: FileProcessorProps) {
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
    onStageChange('extracting');
    
    try {
      // Extract text from the file based on its type
      let text = '';
      
      if (fileToProcess.type.includes('image')) {
        console.log('Starting image text extraction...');
        text = await extractTextFromImage(fileToProcess);
        console.log('Finished image text extraction.');
      } else if (fileToProcess.type === 'application/pdf') {
        console.log('Starting PDF text extraction...');
        text = await extractTextFromPDF(fileToProcess);
        console.log('Finished PDF text extraction.');
      } else if (fileToProcess.type === 'text/plain') {
        console.log('Reading text file...');
        text = await fileToProcess.text();
        console.log('Finished reading text file.');
      }

      if (!text.trim()) {
        throw new Error('No text could be extracted from the file.');
      }

      onTextExtracted(text);
    } catch (err) {
      console.error('Error processing file:', err);
      onError(err instanceof Error ? err.message : 'An unknown error occurred');
      onStageChange(null);
    }
  }, [onTextExtracted, onError, onProcessingChange, onStageChange]);
  
  // Use useEffect to process file when it changes
  useEffect(() => {
    if (file) {
      processFile(file);
    }
  }, [file, processFile]);
  
  // This component doesn't render anything visible
  return null;
} 