import { SocialPublication } from '../../app/components/publications/types';
import publicationsData from './SocialPublications.json';

/**
 * Loads and processes social publications data from JSON file
 */
export function loadSocialPublications(): SocialPublication[] {
  try {
    const publications = publicationsData as SocialPublication[];
    
    // Sort by date (most recent first)
    return publications.sort((a, b) => {
      const dateA = new Date(a.publicationDate);
      const dateB = new Date(b.publicationDate);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Failed to load social publications:', error);
    return [];
  }
}

/**
 * Formats date string for display
 */
export function formatPublicationDate(dateString: string): string {
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
 * Gets featured publications for carousel display
 */
export function getFeaturedPublications(limit: number = 4): SocialPublication[] {
  const allPublications = loadSocialPublications();
  return allPublications.slice(0, limit);
}

/**
 * Groups publications by type
 */
export function getPublicationsByType(): Record<string, SocialPublication[]> {
  const publications = loadSocialPublications();
  return publications.reduce((acc, publication) => {
    if (!acc[publication.type]) {
      acc[publication.type] = [];
    }
    acc[publication.type].push(publication);
    return acc;
  }, {} as Record<string, SocialPublication[]>);
}
