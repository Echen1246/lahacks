import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, settings } from '../config';
import { findYouTubeVideoUrl } from './youtubeService'; // Import the new YouTube service

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Generate a chronological list of YouTube videos based on syllabus content,
 * then search YouTube for actual video URLs.
 */
export async function generateVideoRecommendations(syllabusText: string): Promise<VideoRecommendation[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
      Here is a syllabus text:

      ${syllabusText}

      Based on this syllabus, generate a chronological list of up to ${settings.maxVideos} YouTube video titles and descriptions
      that would be helpful for learning the topics. Return the results as a JSON array with the following format:
      [
        {
          "title": "Video title",
          "description": "Short description of what this video covers",
          "topicOrder": 1
        }
      ]

      Do NOT include a videoUrl field in the JSON response.
      Ensure the videos are ordered to match the syllabus flow from beginning to end content.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      console.error('Failed to parse JSON from Gemini response for videos:', text);
      throw new Error('Failed to parse video recommendations JSON from Gemini response');
    }

    let initialRecommendations: Omit<VideoRecommendation, 'videoUrl'>[] = [];
    try {
        initialRecommendations = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
        console.error('Error parsing initial video recommendations JSON:', parseError, jsonMatch[0]);
        throw new Error('Failed to parse video recommendations JSON from Gemini response');
    }

    // Now, enrich recommendations with actual YouTube URLs
    const enrichedRecommendations: VideoRecommendation[] = await Promise.all(
      initialRecommendations.map(async (rec) => {
        const videoUrl = await findYouTubeVideoUrl(rec.title);
        return { ...rec, videoUrl }; // Add the found videoUrl
      })
    );

    return enrichedRecommendations;

  } catch (error) {
    console.error('Error generating video recommendations:', error);
    // Propagate the error but add context
    if (error instanceof Error) {
        throw new Error(`Failed to generate video recommendations: ${error.message}`);
    } else {
        throw new Error('Failed to generate video recommendations due to an unknown error');
    }
  }
}

/**
 * Generate a study guide based on syllabus content
 */
export async function generateStudyGuide(syllabusText: string): Promise<StudyGuide> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
      Here is a syllabus text:

      ${syllabusText}

      Based on this syllabus, create a comprehensive study guide that:
      1. Outlines all the key topics in chronological order
      2. Provides explanations for each topic
      3. Includes learning objectives for each section

      Return the result as a JSON object with the following format:
      {
        "title": "Study Guide for [Course Name]",
        "sections": [
          {
            "sectionTitle": "Section title",
            "topics": [
              {
                "name": "Topic name",
                "explanation": "Detailed explanation",
                "learningObjectives": ["objective 1", "objective 2"]
              }
            ]
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        console.error('Failed to parse JSON from Gemini response for study guide:', text);
        throw new Error('Failed to parse study guide JSON from Gemini response');
    }
    
    try {
        return JSON.parse(jsonMatch[0]) as StudyGuide;
    } catch (parseError) {
        console.error('Error parsing study guide JSON:', parseError, jsonMatch[0]);
        throw new Error('Failed to parse study guide JSON from Gemini response');
    }

  } catch (error) {
    console.error('Error generating study guide:', error);
    // Propagate the error but add context
    if (error instanceof Error) {
        throw new Error(`Failed to generate study guide: ${error.message}`);
    } else {
        throw new Error('Failed to generate study guide due to an unknown error');
    }
  }
}

// Type definitions
export interface VideoRecommendation {
  title: string;
  description: string;
  videoUrl: string; // Will be populated by YouTube search
  topicOrder: number;
}

export interface StudyGuide {
  title: string;
  sections: StudySection[];
}

export interface StudySection {
  sectionTitle: string;
  topics: StudyTopic[];
}

export interface StudyTopic {
  name: string;
  explanation: string;
  learningObjectives: string[];
} 