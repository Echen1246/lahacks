import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, settings } from '../config';
import { findYouTubeVideoUrl } from './youtubeService'; // Import the new YouTube service

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Generate a chronological list of YouTube videos based on Study Guide topics,
 * then search YouTube for actual video URLs.
 * @param topics - An array of topics extracted from the generated Study Guide.
 */
export async function generateVideoRecommendations(topics: StudyTopic[]): Promise<VideoRecommendation[]> {
  try {
    if (!topics || topics.length === 0) {
        console.warn('No topics provided for video recommendation generation.');
        return [];
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Create a string representation of the topics for the prompt
    const topicListString = topics.map((topic, index) => `${index + 1}. ${topic.name}`).join('\n');

    // Updated prompt using the provided topics
    const prompt = `
      Based on the following list of course topics extracted from a study guide:
      
      --- Topic List ---
      ${topicListString}
      --- End Topic List ---
      
      Generate a list of relevant YouTube video titles and descriptions that would help someone learn these specific topics.
      Distribute approximately ${settings.maxVideos} video recommendations across these topics, focusing on the most helpful resources.
      Maintain the original chronological order of the topics provided.
      
      Return the results as a JSON array with the following format (Do NOT include the videoUrl field):
      [
        {
          "title": "Video title (related to one of the topics above)",
          "description": "Short description explaining how this video relates to the specific topic",
          "topicOrder": 1 // Sequential order reflecting the provided topic list
        }
      ]
    `;

    console.log("Sending prompt to Gemini for video recommendations based on topics...");
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

    console.log(`Received ${initialRecommendations.length} initial recommendations from Gemini.`);

    // Now, enrich recommendations with actual YouTube URLs
    console.log('Starting YouTube search for video URLs...');
    const enrichedRecommendations: VideoRecommendation[] = await Promise.all(
      initialRecommendations.map(async (rec) => {
        const videoUrl = await findYouTubeVideoUrl(rec.title);
        console.log(`YouTube search for "${rec.title}": ${videoUrl || 'Not Found'}`);
        return { ...rec, videoUrl };
      })
    );
    console.log('Finished YouTube search.');

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
      1. Identifies the distinct modules, weeks, or logical sections presented in the syllabus.
      2. For EACH distinct module/week/section identified, creates a separate entry in the "sections" array below.
      3. Within each section entry, outlines the key topics covered in that specific module/week/section in chronological order.
      4. Provides explanations for each topic.
      5. Includes learning objectives for each topic (if available in the syllabus or inferrable).

      Return the result as a JSON object with the following format. Ensure EACH logical unit (module, week, etc.) from the syllabus gets its own object within the "sections" array:
      {
        "title": "Study Guide for [Course Name Based on Syllabus]",
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