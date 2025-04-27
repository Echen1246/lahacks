'use client'; // Ensure this runs client-side

import jsPDF from 'jspdf';
import { StudyGuide, VideoRecommendation } from '../services/geminiService';

// Helper function to add text and handle page breaks
function addTextWithWrap(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, options = {}): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y, options);
  return y + (lines.length * doc.getLineHeight()); // Return new Y position
}

export function generatePdf(studyGuide: StudyGuide | null, videoList: VideoRecommendation[], fileName: string = 'Syllabus_Learning_Materials.pdf') {
  if (!studyGuide && videoList.length === 0) {
    console.error('No data available to generate PDF.');
    alert('No study guide or video recommendations available to download.');
    return;
  }

  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  let currentY = margin;

  // --- Study Guide Section --- 
  if (studyGuide) {
    doc.setFontSize(18);
    currentY = addTextWithWrap(doc, studyGuide.title || 'Study Guide', margin, currentY, maxWidth);
    currentY += 5; // Add some space

    studyGuide.sections.forEach((section) => {
      if (currentY > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
      doc.setFontSize(14);
      currentY = addTextWithWrap(doc, section.sectionTitle, margin, currentY, maxWidth);
      currentY += 3;

      section.topics.forEach((topic) => {
        if (currentY > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }
        doc.setFontSize(12);
        currentY = addTextWithWrap(doc, `Topic: ${topic.name}`, margin, currentY, maxWidth, { fontStyle: 'bold' });
        currentY += 2;
        doc.setFontSize(10);
        currentY = addTextWithWrap(doc, `Explanation: ${topic.explanation}`, margin, currentY, maxWidth);
        currentY += 2;
        if (topic.learningObjectives && topic.learningObjectives.length > 0) {
          currentY = addTextWithWrap(doc, 'Learning Objectives:', margin, currentY, maxWidth, { fontStyle: 'italic' });
          topic.learningObjectives.forEach(obj => {
             if (currentY > pageHeight - margin) {
                doc.addPage();
                currentY = margin;
             }
             currentY = addTextWithWrap(doc, `- ${obj}`, margin + 5, currentY, maxWidth - 5);
          });
        }
        currentY += 5; // Space between topics
      });
      currentY += 5; // Space between sections
    });
    currentY += 10; // Add space before next section
  }

  // --- Video Recommendations Section --- 
  if (videoList.length > 0) {
    if (currentY > pageHeight - margin * 2) { // Check if space needed for header
      doc.addPage();
      currentY = margin;
    }
    doc.setFontSize(18);
    currentY = addTextWithWrap(doc, 'Video Recommendations', margin, currentY, maxWidth);
    currentY += 5;

    videoList.forEach((video) => {
      if (currentY > pageHeight - margin * 2) { // Check space for video entry
        doc.addPage();
        currentY = margin;
      }
      doc.setFontSize(12);
      currentY = addTextWithWrap(doc, `${video.topicOrder}. ${video.title}`, margin, currentY, maxWidth, { fontStyle: 'bold' });
      currentY += 2;
      doc.setFontSize(10);
      currentY = addTextWithWrap(doc, video.description, margin, currentY, maxWidth);
      if (video.videoUrl) {
        currentY = addTextWithWrap(doc, `URL: ${video.videoUrl}`, margin, currentY, maxWidth, { textColor: 'blue' });
        // Note: jsPDF doesn't natively support clickable links easily without plugins or complex drawing
      }
      currentY += 5; // Space between videos
    });
  }

  // --- Save the PDF --- 
  doc.save(fileName);
} 