'use client';

import { useState } from 'react';
import FileUploader from './components/FileUploader';
import VideoList from './components/VideoList';
import StudyGuideView from './components/StudyGuideView';
import FileProcessor from './components/FileProcessor';
import ProgressBar from './components/ProgressBar';
import { VideoRecommendation, StudyGuide, StudyTopic, generateVideoRecommendations, generateStudyGuide } from './services/geminiService';
import { generatePdf } from './utils/generatePdf';

// Updated stage names for the progress bar
const stageNames = {
  extracting: 'Extracting text from syllabus...',
  generating_guide: 'Generating study guide...',
  generating_videos: 'Finding relevant videos...',
  done: 'Processing complete!',
};
const totalStages = Object.keys(stageNames).length;

// Import text extraction services only on client side - Removed unused variables
// let extractTextFromImage: (file: File) => Promise<string>;
// let extractTextFromPDF: (file: File) => Promise<string>;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  // const [extractedText, setExtractedText] = useState<string | null>(null); // Removed unused state
  const [videoList, setVideoList] = useState<VideoRecommendation[]>([]);
  const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(null);
  const [activeTab, setActiveTab] = useState<'videos' | 'guide'>('guide'); // Default to guide tab
  const [error, setError] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<string | null>(null);

  // Handle text extraction completion - now triggers sequential generation
  const handleTextExtracted = async (text: string) => {
    // setExtractedText(text); // Removed assignment to unused state
    setStudyGuide(null); // Clear previous results
    setVideoList([]);
    setError(null);

    // --- Generate Study Guide --- 
    setProcessingStage('generating_guide');
    let generatedGuide: StudyGuide | null = null;
    try {
      console.log('Starting generation of study guide...');
      generatedGuide = await generateStudyGuide(text);
      setStudyGuide(generatedGuide);
      console.log('Finished study guide generation.');

      if (!generatedGuide || generatedGuide.sections.length === 0) {
        throw new Error('Study guide generation failed or returned no sections.');
      }

      // --- Generate Video Recommendations (based on guide topics) --- 
      setProcessingStage('generating_videos');
      console.log('Starting generation of video recommendations...');
      // Extract topics from the generated guide to pass to video generator
      const topicsForVideos: StudyTopic[] = generatedGuide.sections.flatMap(section => section.topics);
      const videos = await generateVideoRecommendations(topicsForVideos); // Pass topics
      setVideoList(videos);
      console.log('Finished video recommendation generation.');

      setProcessingStage('done'); // All done

    } catch (err) {
      console.error('Error during generation process:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during generation');
      setProcessingStage(null); // Clear stage on error
    } finally {
      setLoading(false); // Set loading to false only after everything is done or errored
    }
  };

  // Handle file selection from uploader
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    // setExtractedText(null); // Removed assignment to unused state
    setVideoList([]);
    setStudyGuide(null);
    setProcessingStage(null); // Reset stage
  };

  // Handler for PDF download button
  const handleDownloadPdf = () => {
    const pdfFileName = file ? `${file.name.replace(/\.[^/.]+$/, "")}_Learning_Materials.pdf` : 'Syllabus_Learning_Materials.pdf';
    generatePdf(studyGuide, videoList, pdfFileName);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
         {/* Header */}
        <div className="text-center mb-8">
          {/* Centered container for the enlarged icon */}
          <div className="flex justify-center mb-4"> {/* Adjusted spacing */} 
            {/* Icon - Assuming syla.svg is in /public - Enlarged further */}
            <img src="/syla.svg" alt="Syllab.ai logo" className="h-40 w-40" /> {/* Increased size again */} 
          </div>
          <p className="text-lg text-gray-600">
            Upload your syllabus to get personalized video recommendations and a detailed study guide with Syllab.ai
          </p>
        </div>

        <FileUploader onFileSelect={handleFileSelect} loading={loading} />

        {/* Render ProgressBar when loading */} 
        {loading && (
          <ProgressBar 
            stage={processingStage}
            totalStages={totalStages}
            stageNames={stageNames}
          />
        )}
        
        {/* File processor (client component) */}
        {file && (
          <FileProcessor 
            file={file}
            onTextExtracted={handleTextExtracted}
            onError={(errMsg) => { setError(errMsg); setLoading(false); setProcessingStage(null); }} // Handle extraction errors
            onProcessingChange={setLoading} 
            onStageChange={setProcessingStage}
          />
        )}

        {/* Error display */} 
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        {/* Results Section */}
        {!loading && (videoList.length > 0 || studyGuide) && (
          <div className="mt-8">
            {/* Download Button */} 
            <div className="mb-4 flex justify-end">
                <button 
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  disabled={!studyGuide && videoList.length === 0}
                >
                    {/* SVG Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Results as PDF
                </button>
            </div>

            {/* Tabs */} 
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                 {/* Study Guide Tab */}
                <button
                  onClick={() => setActiveTab('guide')}
                  className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'guide'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Study Guide
                </button>
                 {/* Video Recommendations Tab */}
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'videos'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Video Recommendations
                </button>
              </nav>
            </div>

            {/* Tab Content */} 
            <div className="mt-6">
              {activeTab === 'guide' && <StudyGuideView studyGuide={studyGuide} />}
              {activeTab === 'videos' && <VideoList videos={videoList} />}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
