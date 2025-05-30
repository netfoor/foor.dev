// Skills types
export interface Skill {
  name: string;
  image: string | null;
  category?: string;
}

export interface SoftSkill {
  name: string;
  icon: string;
  description: string;
  example: string;
}

export interface SkillsData {
  Skills: {
    awsCoreServices: Skill[];
    containersOrchestration: Skill[];
    infrastructureAsCode: Skill[];
    ciCdDevOps: Skill[];
    programmingLanguages: Skill[];
    monitoringObservability: Skill[];
    databases: Skill[];
    networkingSecurity: Skill[];
    managementGovernance: Skill[];
    architecturalConcepts: Skill[];
    systemsHardware: Skill[];
    coreTechnologies: Skill[];
  };
  SoftSkills: SoftSkill[];
}

export interface SkillCategory {
  name: string;
  skills: Skill[];
  icon: string;
}
