import { VideoRecommendation } from '../services/geminiService';
import { useState } from 'react';

interface VideoListProps {
  videos: VideoRecommendation[];
}

export default function VideoList({ videos }: VideoListProps) {
  const [expandedVideo, setExpandedVideo] = useState<number | null>(null);
  // State to track completed videos (index: boolean)
  const [completedVideos, setCompletedVideos] = useState<Record<number, boolean>>({});

  const toggleExpand = (index: number) => {
    if (expandedVideo === index) {
      setExpandedVideo(null);
    } else {
      setExpandedVideo(index);
    }
  };

  // Handler for checkbox changes
  const handleCheckboxChange = (index: number, isChecked: boolean) => {
    setCompletedVideos(prev => ({ ...prev, [index]: isChecked }));
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    return url; // Return original URL if no match
  };

  if (!videos || videos.length === 0) {
    return <p className="text-center text-gray-500 my-8">No videos available.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Recommended Videos</h2>
      
      {videos.map((video, index) => (
        <div 
          key={index}
          className="border rounded-lg shadow-sm overflow-hidden bg-white"
        >
          <div 
            className="p-4 hover:bg-gray-50 flex justify-between items-center cursor-pointer"
            onClick={() => toggleExpand(index)}
          >
            <div className="flex items-center space-x-3 flex-grow min-w-0">
              <input 
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={!!completedVideos[index]}
                onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-grow min-w-0">
                <h3 className={`font-medium text-gray-900 truncate ${completedVideos[index] ? 'line-through text-gray-500' : ''}`}>{video.title}</h3>
                <p className={`text-sm text-gray-500 line-clamp-2 ${completedVideos[index] ? 'line-through' : ''}`}>{video.description}</p>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 text-gray-500 transition-transform ${expandedVideo === index ? 'transform rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {expandedVideo === index && video.videoUrl && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="relative pb-[56.25%] h-0 overflow-hidden max-w-full" style={{ height: '400px' }}>
                <iframe
                  src={getYouTubeEmbedUrl(video.videoUrl)}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                ></iframe>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 