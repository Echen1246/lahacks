import { StudyGuide } from '../services/geminiService';
import { useState } from 'react';

interface StudyGuideViewProps {
  studyGuide: StudyGuide | null;
}

export default function StudyGuideView({ studyGuide }: StudyGuideViewProps) {
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  
  if (!studyGuide) {
    return null;
  }

  const toggleSection = (sectionIndex: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex],
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-900">{studyGuide.title}</h2>
        <p className="mt-1 text-sm text-gray-500">
          A comprehensive guide to help you master the course material
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {studyGuide.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="border-b border-gray-200 last:border-b-0">
            <button
              className="w-full px-4 py-4 sm:px-6 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition duration-150 ease-in-out"
              onClick={() => toggleSection(sectionIndex)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {section.sectionTitle}
                </h3>
                <svg
                  className={`h-5 w-5 text-gray-500 transform transition-transform ${
                    expandedSections[sectionIndex] ? 'rotate-180' : ''
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </button>

            {expandedSections[sectionIndex] && (
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                {section.topics.map((topic, topicIndex) => (
                  <div key={topicIndex} className="mb-6 last:mb-0">
                    <h4 className="text-md font-semibold text-gray-900 mb-2">
                      {topic.name}
                    </h4>
                    <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">
                      {topic.explanation}
                    </p>
                    
                    {topic.learningObjectives && topic.learningObjectives.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">
                          Learning Objectives:
                        </h5>
                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                          {topic.learningObjectives.map((objective, i) => (
                            <li key={i}>{objective}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 