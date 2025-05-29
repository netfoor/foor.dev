export interface ProjectItem {
  title: string;
  photoUrl?: string;
  description: string;
  projectUrl?: string | null;
  place: string;
  skills: string[];
  gallery?: string[];
  categories: string;
}

export interface ProjectCardProps extends ProjectItem {
  // Any additional props specific to the card's presentation, if needed
}

export interface ProjectsSectionProps {
  projects: ProjectItem[];
  showAll?: boolean;
  maxDisplay?: number;
}
