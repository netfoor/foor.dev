import { Recognition } from '../../app/components/recognitions/types';
import recognitionsData from './Recognitions.json';

/**
 * Loads and processes recognition data from JSON file
 */
export function loadRecognitions(): Recognition[] {
  try {
    const recognitions = recognitionsData as Recognition[];
    
    // Sort by date (most recent first)
    return recognitions.sort((a, b) => {
      const dateA = new Date(a.issueDate);
      const dateB = new Date(b.issueDate);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Failed to load recognitions:', error);
    return [];
  }
}

/**
 * Formats date string for display
 */
export function formatRecognitionDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * Gets the most recent recognitions for preview
 */
export function getRecentRecognitions(limit: number = 3): Recognition[] {
  const allRecognitions = loadRecognitions();
  return allRecognitions.slice(0, limit);
}