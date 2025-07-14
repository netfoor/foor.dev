'use client';

import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '../../../amplify/data/resource';

export type Skill = Schema['Skills']['type'];

// Define filter type based on schema
type SkillFilter = {
  isActive?: { eq: boolean };
  isCore?: { eq: boolean };
}

export const loadSkillsFromAmplify = async (filterOptions?: { onlyCore?: boolean }) => {
  try {
    const client = generateClient<Schema>();
    
    let filter: SkillFilter = { isActive: { eq: true } };
    
    // Add isCore filter if requested
    if (filterOptions?.onlyCore) {
      filter = {
        ...filter,
        isCore: { eq: true }
      };
    }
    
    const response = await client.models.Skills.list({ filter });
    
    if (response.data) {
      // Sort skills by priority
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
