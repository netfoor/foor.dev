// Define types for skill data
export interface Skill {
  id?: string;
  name: string;
  description?: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: string;
  iconKey?: string;
  iconUrl?: string;
  yearsOfExperience?: number;
  priority?: number;
  isActive?: boolean;
}

export interface SoftSkill {
  id?: string;
  name: string;
  description?: string;
  examples?: string[];
  achievements?: string[];
  iconKey?: string;
  iconUrl?: string;
  priority?: number;
  isActive?: boolean;
}

export interface SkillCategory {
  name: string;
  icon: string;
  skills: Skill[];
}

export interface SkillsData {
  TechnicalSkills: Skill[];
  SoftSkills: SoftSkill[];
}
