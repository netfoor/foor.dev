'use client';

import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '../../../amplify/data/resource';
import { fetchAuthSession } from 'aws-amplify/auth';

export type Skill = Schema['Skills']['type'];

// Define filter type based on schema
type SkillFilter = {
  isActive?: { eq: boolean };
  isCore?: { eq: boolean };
}

export const loadSkillsFromAmplify = async (filterOptions?: { onlyCore?: boolean }) => {
  try {
    const client = generateClient<Schema>();

    // Build filters: show items where isActive == true OR isActive is null (legacy)
    const baseFilter: any = {
      or: [
        { isActive: { eq: true } },
        { isActive: { attributeExists: false } },
        { isActive: { eq: null } }
      ]
    };

    let filter: any = baseFilter;

    if (filterOptions?.onlyCore) {
      filter = {
        and: [
          baseFilter,
          { isCore: { eq: true } }
        ]
      };
    }

    // Determine auth mode: try apiKey, but if user signed in use userPool
    let authMode: 'apiKey' | 'userPool' = 'apiKey';
    try {
      const session = await fetchAuthSession();
      if (session?.tokens?.idToken || session?.tokens?.accessToken) {
        authMode = 'userPool';
      }
    } catch (_) {
      // ignore, fallback to apiKey
    }
    
    const response = await client.models.Skills.list({ 
      filter,
      authMode
    });

    if (response.data) {
      const sortedSkills = [...response.data].sort((a, b) => {
        if (a.priority !== null && b.priority !== null) {
          return a.priority - b.priority;
        }
        if (a.priority !== null) return -1;
        if (b.priority !== null) return 1;
        return (a.name || '').localeCompare(b.name || '');
      });
      return sortedSkills;
    }

    return [];
  } catch (error) {
    console.error('Error loading skills from Amplify:', error);
    throw error;
  }
};
