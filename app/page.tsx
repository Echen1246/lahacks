'use client';

import { useState } from 'react';
import FileUploader from './components/FileUploader';
import VideoList from './components/VideoList';
import StudyGuideView from './components/StudyGuideView';
import FileProcessor from './components/FileProcessor';
import { VideoRecommendation, StudyGuide, generateVideoRecommendations, generateStudyGuide } from './services/geminiService';

// Import text extraction services only on client side
let extractTextFromImage: (file: File) => Promise<string>;
let extractTextFromPDF: (file: File) => Promise<string>;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [videoList, setVideoList] = useState<VideoRecommendation[]>([]);
  const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(null);
  const [activeTab, setActiveTab] = useState<'videos' | 'guide'>('videos');
  const [error, setError] = useState<string | null>(null);

  // Handle text extraction completion
  const handleTextExtracted = async (text: string) => {
    setExtractedText(text);
    try {
      // Generate video recommendations and study guide
      const [videos, guide] = await Promise.all([
        generateVideoRecommendations(text),
        generateStudyGuide(text)
      ]);

      setVideoList(videos);
      setStudyGuide(guide);
    } catch (err) {
      console.error('Error generating content:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setExtractedText(null);
    setVideoList([]);
    setStudyGuide(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Syllabus Learning Assistant</h1>
          <p className="text-lg text-gray-600">
            Upload your syllabus to get personalized video recommendations and a detailed study guide
          </p>
        </div>

        <FileUploader onFileSelect={handleFileSelect} loading={loading} />
        
        {/* Client component that processes the file */}
        {file && (
          <FileProcessor 
            file={file}
            onTextExtracted={handleTextExtracted}
            onError={setError}
            onProcessingChange={setLoading}
          />
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {(videoList.length > 0 || studyGuide) && (
          <div className="mt-8">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
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
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === 'videos' && <VideoList videos={videoList} />}
              {activeTab === 'guide' && <StudyGuideView studyGuide={studyGuide} />}
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]"></div>
            <p className="mt-2 text-gray-600">Processing your syllabus...</p>
          </div>
        )}
      </div>
    </main>
  );
}
