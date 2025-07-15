'use client';

import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '../../../amplify/data/resource';

export type Recognition = Schema['Recognitions']['type'];
export type Publication = Schema['SocialPublications']['type'];

export const loadRecognitionsFromAmplify = async (limit?: number, isAuthenticated?: boolean) => {
  try {
    const client = generateClient<Schema>();
    const response = await client.models.Recognitions.list({
      limit: limit || undefined,
      authMode: isAuthenticated ? 'userPool' : 'identityPool',
    });
    
    if (response.data) {
      // Sort by issue date descending (newest first)
      const sortedRecognitions = [...response.data].sort((a, b) => {
        if (a.issueDate && b.issueDate) {
          return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
        }
        return 0;
      });
      
      return sortedRecognitions;
    }
    
    return [];
  } catch (error) {
    console.error('Error loading recognitions from Amplify:', error);
    throw error;
  }
};

export const loadPublicationsFromAmplify = async (limit?: number, isAuthenticated?: boolean) => {
  try {
    const client = generateClient<Schema>();
    const response = await client.models.SocialPublications.list({
      limit: limit || undefined,
      authMode: isAuthenticated ? 'userPool' : 'identityPool',
    });
    
    if (response.data) {
      // Sort by publication date descending (newest first)
      const sortedPublications = [...response.data].sort((a, b) => {
        if (a.publicationDate && b.publicationDate) {
          return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
        }
        return 0;
      });
      
      return sortedPublications;
    }
    
    return [];
  } catch (error) {
    console.error('Error loading publications from Amplify:', error);
    throw error;
  }
};

/**
 * Gets the URL for an image stored in S3
 * @param photoKey S3 key for the image
 * @returns URL of the image or null if there's an error
 */
export const getImageUrl = async (photoKey: string | null | undefined): Promise<string | null> => {
  if (!photoKey) return null;
  
  try {
    // Normalize the path - remove 'public/' if it exists (for compatibility with Gen 1)
    const normalizedPath = photoKey.startsWith('public/') ? photoKey.slice(7) : photoKey;
    
    const url = await getUrl({ path: normalizedPath });
    return url.url.toString();
  } catch (err) {
    console.error('Error getting image URL for key:', photoKey, err);
    return null;
  }
};
