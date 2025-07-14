'use client';

import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '../.../../../../../../amplify/data/resource'; // Adjust the import path as needed
import { Skill, SoftSkill, SkillCategory, SkillsData } from './types';

// Icons for categories
const categoryIcons: Record<string, string> = {
  'Cloud Platforms': '☁️',
  'Programming Languages': '💻',
  'Frameworks & Libraries': '🧩',
  'DevOps & Tools': '🛠️',
  'Databases': '🗄️',
  'Architecture & Design': '🏗️',
  'Soft Skills': '🧠',
};

// Load skills data from Amplify DataStore
export async function loadSkillsData(): Promise<SkillsData> {
  try {
    const client = generateClient<Schema>();
    
    const response = await client.models.Skills.list({
      filter: {
        isActive: {
          eq: true
        }
      }
    });

    // Sort by priority and name after fetching
    if (response.data) {
      response.data = response.data.sort((a, b) => {
        const priorityA = a.priority ?? 0;
        const priorityB = b.priority ?? 0;
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        return a.name.localeCompare(b.name);
      });
    }
    
    if (!response.data) {
      throw new Error('No skills data found');
    }

    // Split into technical and soft skills
    const technicalSkills: Skill[] = [];
    const softSkills: SoftSkill[] = [];

    // Fetch image URLs for all skills
    for (const skill of response.data) {
      if (!skill.type) continue;
      
      let iconUrl: string | undefined;
      
      if (skill.iconKey) {
        try {
          const normalizedPath = skill.iconKey.startsWith('public/') 
            ? skill.iconKey.slice(7) 
            : skill.iconKey;
          
          const result = await getUrl({
            path: normalizedPath,
          });
          
          iconUrl = result.url.toString();
        } catch (error) {
          console.warn('Could not load icon for skill:', skill.name);
        }
      }

      if (skill.type === 'Technical') {
        technicalSkills.push({
          id: skill.id,
          name: skill.name,
          description: skill.description || undefined,
          proficiency: skill.proficiency as 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert',
          category: skill.category || 'Other',
          iconUrl,
          yearsOfExperience: skill.yearsOfExperience || undefined,
          priority: skill.priority || undefined,
        });
      } else if (skill.type === 'Soft') {
        softSkills.push({
          id: skill.id,
          name: skill.name,
          description: skill.description || undefined,
          examples: skill.examples?.filter(ex => ex !== null) as string[] || [],
          achievements: skill.achievements?.filter(ach => ach !== null) as string[] || [],
          iconUrl,
          priority: skill.priority || undefined,
        });
      }
    }

    return {
      TechnicalSkills: technicalSkills,
      SoftSkills: softSkills,
    };
    
  } catch (error) {
    console.error('Error loading skills data:', error);
    return {
      TechnicalSkills: [],
      SoftSkills: [],
    };
  }
}

// Group skills by category
export function getSkillCategories(skillsData: SkillsData): SkillCategory[] {
  const { TechnicalSkills } = skillsData;
  
  // Group skills by category
  const skillsByCategory: Record<string, Skill[]> = {};
  
  TechnicalSkills.forEach(skill => {
    const category = skill.category;
    if (!skillsByCategory[category]) {
      skillsByCategory[category] = [];
    }
    skillsByCategory[category].push(skill);
  });
  
  // Convert to array of SkillCategory
  const categories: SkillCategory[] = Object.keys(skillsByCategory).map(category => ({
    name: category,
    icon: categoryIcons[category] || '🔧',
    skills: skillsByCategory[category]
  }));
  
  // Sort categories by priority
  return categories.sort((a, b) => {
    const order = [
      'Cloud Platforms', 
      'Programming Languages', 
      'Frameworks & Libraries',
      'DevOps & Tools',
      'Databases',
      'Architecture & Design'
    ];
    
    const indexA = order.indexOf(a.name);
    const indexB = order.indexOf(b.name);
    
    if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  });
}
