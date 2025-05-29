import { ProjectItem } from './types';
import projectsData from '@/utils/data-loader/Projects.json';

export function getProjects(): ProjectItem[] {
  return projectsData as ProjectItem[];
}

export function getFeaturedProjects(limit: number = 4): ProjectItem[] {
  // Return projects with priority: Professional > Research > Hackathon
  const priorityOrder = ['professional', 'research', 'hackathon'];
  
  return (projectsData as ProjectItem[])
    .sort((a: ProjectItem, b: ProjectItem) => {
      const priorityA = priorityOrder.indexOf(a.categories.toLowerCase());
      const priorityB = priorityOrder.indexOf(b.categories.toLowerCase());
      
      // If same priority, sort by availability of projectUrl (live projects first)
      if (priorityA === priorityB) {
        if (a.projectUrl && !b.projectUrl) return -1;
        if (!a.projectUrl && b.projectUrl) return 1;
        return 0;
      }
      
      return priorityA - priorityB;
    })
    .slice(0, limit);
}

export function getProjectsByCategory(category: string): ProjectItem[] {
  return (projectsData as ProjectItem[]).filter((project: ProjectItem) => 
    project.categories.toLowerCase() === category.toLowerCase()
  );
}
