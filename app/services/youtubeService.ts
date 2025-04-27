import axios from 'axios';
import { YOUTUBE_API_KEY } from '../config';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

/**
 * Searches YouTube for a video based on a query and returns the URL of the top result.
 * @param query The search term (e.g., video title).
 * @returns The URL of the first video found, or an empty string if none found or error occurs.
 */
export async function findYouTubeVideoUrl(query: string): Promise<string> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API Key is not configured. Skipping video search.');
    return '';
  }

  try {
    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        part: 'snippet',
        q: query,
        key: YOUTUBE_API_KEY,
        maxResults: 1, // We only need the top result
        type: 'video',
      },
    });

    if (response.data && response.data.items && response.data.items.length > 0) {
      const videoId = response.data.items[0].id.videoId;
      return `https://www.youtube.com/watch?v=${videoId}`;
    }

    console.warn(`No YouTube video found for query: "${query}"`);
    return ''; // No video found
  } catch (error: any) {
    console.error('Error searching YouTube:', error.response?.data || error.message);
    // Don't throw an error, just return empty string so the app can continue
    return '';
  }
} 